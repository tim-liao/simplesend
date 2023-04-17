import amqp from "amqplib/callback_api.js";
import { Base64 } from "js-base64";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
import client from "./model/ses_config.js";
import {
  selectAllSendEmailInformation,
  updateSendEmailRequestStatusAndTriggerTime,
  updateSendEmailRequestStatus,
  insertDefaultSendEmailLog,
  updateSendEmailLog,
  selectUserSettingString,
} from "./model/sql_model.js";
import { generateTimeNow } from "./model/time_model.js";
import { transformToTrackedHTML } from "./model/transform_html_model.js";
import moment from "moment";
import { getTxtDNSSetting } from "./model/dns_model.js";
import { Server } from "socket.io";
import { createServer } from "http";
dotenv.config();
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", //我的電腦
    // origin: `${process.env.URL}:3000`,
  },
});

httpServer.listen(3030);

dotenv.config();
const users = {};
io.on("connection", (socket) => {
  let userId;
  const socketId = socket.id;
  socket.on("toserver", (id) => {
    users[id] = socketId;
    userId = id;
    console.log(users);
  });
  socket.emit("toclient", `socket.io connected`);
  socket.on("disconnect", () => {
    const userId = Object.keys(users).find((key) => users[key] === socketId);
    if (userId) {
      // delete users[userId];
      console.log(new Date(Date.now()), users);
    }
  });
});

const updateDashboard = function (userId) {
  const socketId = users[userId];
  if (socketId) {
    console.log("connected");
    io.to(socketId).emit(
      "updateDashboard",
      `successfully send email:userId = ${userId}`
    );
  }
};
amqp.connect("amqp://localhost?heartbeat=5", function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = process.env.QUEUE_NAME;

    channel.assertQueue(queue, {
      durable: false,
    });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(
      queue,
      async function (msg) {
        let sendEmailId = msg.content.toString();
        // console.log(originalSendEmailInformation);
        // 把東西從資料庫拿出來
        let allSendEmailInformation;
        try {
          allSendEmailInformation = await selectAllSendEmailInformation(
            sendEmailId
          );
        } catch (e) {
          const err = new Error("cannot selectAllSendEmailInformation in sql");
          err.stack = "cannot selectAllSendEmailInformation in sql";
          err.status = 500;
          console.log(e);
        }
        // 把first_trigger_dt改成現在，並把狀態改成triggered
        try {
          let triggerTime = generateTimeNow();
          await updateSendEmailRequestStatusAndTriggerTime(
            triggerTime,
            "triggered",
            sendEmailId
          );
        } catch (e) {
          const err = new Error("cannot update trigger_dt and status in sql");
          err.stack = "cannot update trigger_dt and status in sql";
          err.status = 500;
          console.log(e);
        }
        //把東西寄出去
        // console.log(allSendEmailInformation);
        const userId = allSendEmailInformation[0].user_id;
        const nameFrom = allSendEmailInformation[0].name_from;
        const emailTo = allSendEmailInformation[0].email_to;
        const emailBcc = allSendEmailInformation[0].email_bcc;
        const emailCc = allSendEmailInformation[0].email_cc;
        const emailReplyTo = allSendEmailInformation[0].email_reply_to;
        const emailSubject = allSendEmailInformation[0].email_subject;
        const emailBodyType = allSendEmailInformation[0].email_body_type;
        const emailBodyContent = allSendEmailInformation[0].email_body_content;
        const trackingOpen = allSendEmailInformation[0].tracking_open;
        const trackingClick = allSendEmailInformation[0].tracking_click;
        // TODO:認真檢查nameFrom是不是使用者可用：web server接收時只有驗證一下下（因為不要讓負載都在web server上，同時不會讓使用者等太久），所以這邊要認真驗證，比照檢查是否可用時驗證20次，20次都通過才放行，不然的話就要存成失敗。
        // 找對應到的userId,string,domainname出來
        let settingString;
        let originalsSettingString;
        try {
          originalsSettingString = await selectUserSettingString(
            userId,
            nameFrom
          );
        } catch (e) {
          console.error(e);
        }
        settingString = originalsSettingString[0].setting_string;
        // 並且用dns跑20次
        let txtDNSSetting = [];
        let verifyTime = 20;
        for (let i = 0; i < verifyTime; i++) {
          let originalTxtDNSSetting;
          try {
            originalTxtDNSSetting = await getTxtDNSSetting(nameFrom);
          } catch (e) {
            console.error(e);
          }
          txtDNSSetting.push(originalTxtDNSSetting[0][0]);
        }
        let sendEmailOrNot = 0;
        // 用一個變數來控制究竟要不要觸發寄件function
        if (txtDNSSetting.length == verifyTime) {
          for (let i = 0; i < verifyTime; i++) {
            if (txtDNSSetting[i] != settingString) {
              // 因為我驗證多次，只要有一次不符合我的字串，就儲存failed及現在時間到我的資料庫，並回傳失敗給他
              // 如果有問題，把send_email_list的send_status改成failed
              try {
                await updateSendEmailRequestStatus("failed", sendEmailId);
              } catch (e) {
                console.error(e);
              }
              // 並且新增send_email_log_list（trigger_dt,send_response_dt都存發現錯誤的當下時間，status code以及sendmessage個別存400以及your name from is not verified）
              let timeNow = generateTimeNow();
              try {
                await insertDefaultSendEmailLog(
                  sendEmailId,
                  0,
                  timeNow,
                  timeNow,
                  400,
                  "your domain name is not verified"
                );
              } catch (e) {
                console.error(e);
              }
            } else if (
              i == verifyTime - 1 &&
              txtDNSSetting[i] == settingString
            ) {
              // 如果沒問題就放行
              sendEmailOrNot = 1;
            }
          }
        } else {
          // 長度不足代表有至少一次回圈失敗，有失敗代表還沒有真的更新完成
          // 如果有問題，把send_email_list的send_status改成failed
          try {
            await updateSendEmailRequestStatus("failed", sendEmailId);
          } catch (e) {
            console.error(e);
          }
          // 並且新增send_email_log_list（trigger_dt,send_response_dt都存發現錯誤的當下時間，status code以及sendmessage個別存400以及your name from is not verified）
          let timeNow = generateTimeNow();
          try {
            await insertDefaultSendEmailLog(
              sendEmailId,
              0,
              timeNow,
              timeNow,
              400,
              "your domain name is not verified"
            );
          } catch (e) {
            console.error(e);
          }
        }

        /////////
        // 檢查emailBcc,emailCc,emailReplyTo是不是undfined，是得話就把這幾個欄位改成空值array
        let eamilBccArray = [];
        let emailCcArray = [];
        let emailReplyToArray = [];

        if (emailBcc != "undfined") {
          eamilBccArray.push(emailBcc);
        }
        if (emailCc != "undfined") {
          emailCcArray.push(emailCc);
        }
        if (emailReplyTo != "undfined") {
          emailReplyToArray.push(emailReplyTo);
        }
        // trackingOpen以及trackingClick對應後有四種狀況，來決定要不要塞入
        let messageBody;
        if (trackingOpen == 1 && trackingClick == 1) {
          if (emailBodyType == "html") {
            // 遍歷全部得html尋找href，把他替換成tracking link
            let HTMLData = transformToTrackedHTML(
              emailBodyContent,
              sendEmailId
            );
            // 最後塞tracking pixel到html尾端
            let base64UTF8EncodedSendEmailId = Base64.encode(`${sendEmailId}`);
            HTMLData += `<img src="${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedSendEmailId}">`;
            // 並分類在html
            messageBody = { Html: { Charset: "UTF-8", Data: HTMLData } };
          } else if (emailBodyType == "text") {
            const err = new Error("text type cannot be tracked click");
            err.stack = "text type cannot be tracked click";
            err.status = 500;
          }
        } else if (trackingOpen == 1 && trackingClick == 0) {
          if (emailBodyType == "html") {
            // 塞tracking pixel到html尾端
            let base64UTF8EncodedSendEmailId = Base64.encode(`${sendEmailId}`);
            let HTMLData =
              emailBodyContent +
              `<img src="${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedSendEmailId}">`;
            // 並分類在html
            messageBody = { Html: { Charset: "UTF-8", Data: HTMLData } };
          } else if (emailBodyType == "text") {
            // 塞tracking pixel到文字後面
            let base64UTF8EncodedSendEmailId = Base64.encode(`${sendEmailId}`);
            let HTMLData =
              emailBodyContent +
              `<img src="${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedSendEmailId}">`;
            // 並分類在html
            messageBody = { Html: { Charset: "UTF-8", Data: HTMLData } };
          }
        } else if (trackingOpen == 0 && trackingClick == 1) {
          if (emailBodyType == "html") {
            // 遍歷全部得html尋找href，把他替換成tracking link
            let HTMLData = transformToTrackedHTML(
              emailBodyContent,
              sendEmailId
            );
            // 並分類在html
            // console.log("HTMLData", HTMLData);
            messageBody = { Html: { Charset: "UTF-8", Data: HTMLData } };
          } else if (emailBodyType == "text") {
            const err = new Error("text type cannot be tracked click");
            err.stack = "text type cannot be tracked click";
            err.status = 500;
          }
        } else if (trackingOpen == 0 && trackingClick == 0) {
          if (emailBodyType == "html") {
            // 直接輸出並分類在html
            messageBody = {
              Html: { Charset: "UTF-8", Data: emailBodyContent },
            };
          } else if (emailBodyType == "text") {
            // 直接輸出並分類在text
            messageBody = {
              Text: { Charset: "UTF-8", Data: emailBodyContent },
            };
          }
        }
        // 把資料準備好做成params
        const params = {
          Destination: {
            CcAddresses: emailCcArray,
            ToAddresses: [emailTo],
            BccAddresses: eamilBccArray,
          },
          Message: {
            Body: messageBody,

            Subject: {
              Charset: "UTF-8",
              Data: emailSubject,
            },
          },
          Source: `${nameFrom}${process.env.FROM_EMAIL}`,
          ReplyToAddresses: emailReplyToArray,
        };
        // 如果東西整理好準備要寄送時就把資料庫得狀態改成pending
        // console.log(messageBody);
        // console.log(params);
        try {
          await updateSendEmailRequestStatus("pending", sendEmailId);
        } catch (e) {
          console.error(e);
        }
        const command = new SendEmailCommand(params);
        let data;
        let count = 1;
        // 04/16變更：原本資料庫裡面count＝０是指第一次寄件就成功，但為了因應認證donmain name，可能在真正寄件前就擋下來，所以把count=0讓給真正沒有寄件的狀況
        let failedSendStatusCode;
        let failedSendMessage;
        async function sendEmailToSES() {
          // 這個function是寄送郵件
          let sendEmailLogId;
          let triggerTimeNow = generateTimeNow();
          let responseDT;
          try {
            // 新增email log資料並說明trigger_dt以及同一個sendemailid的寄件次數
            sendEmailLogId = await insertDefaultSendEmailLog(
              sendEmailId,
              count,
              triggerTimeNow,
              triggerTimeNow,
              0,
              "default"
            );
          } catch (e) {
            console.error(e);
          }

          try {
            data = await client.send(command);
          } catch (e) {
            failedSendStatusCode = e["$metadata"].httpStatusCode;
            failedSendMessage = e.message;
            // console.error(e["$metadata"].httpStatusCode, e.message);
          } finally {
            responseDT = generateTimeNow();
          }
          count++;
          // 寄件成功就資料庫得狀態改成success，並紀錄回傳email log以及回傳時間紀錄到資料庫
          if (data && data["$metadata"].httpStatusCode == 200) {
            try {
              await updateSendEmailLog(
                sendEmailLogId,
                responseDT,
                200,
                "successfully send email"
              );
            } catch (e) {
              console.error(e);
            }
            try {
              await updateSendEmailRequestStatus("success", sendEmailId);
            } catch (e) {
              console.error(e);
            }
            updateDashboard(userId);
          } else if (!data && count < 6) {
            // 寄件失敗但在補寄過程時，不需要變更資料庫寄件狀態，但要紀錄email log，並紀錄回傳時間到資料庫
            setTimeout(myFunction, count * 2000);
            try {
              await updateSendEmailLog(
                sendEmailLogId,
                responseDT,
                failedSendStatusCode,
                failedSendMessage
              );
            } catch (e) {
              console.error(e);
            }
          } else if (!data && count == 6) {
            // 若是自動補寄完仍然失敗，變更資料庫寄件狀態為failed，並紀錄email log，並紀錄回傳時間到資料庫
            try {
              await updateSendEmailLog(
                sendEmailLogId,
                responseDT,
                failedSendStatusCode,
                failedSendMessage
              );
            } catch (e) {
              console.error(e);
            }
            try {
              await updateSendEmailRequestStatus("failed", sendEmailId);
            } catch (e) {
              console.error(e);
            }
            updateDashboard(userId);
          }
        }

        // 在第一次調用時，第一次0秒後執行
        if (sendEmailOrNot == 1) {
          setTimeout(sendEmailToSES, 0);
        }
      },
      {
        noAck: true,
      }
    );
  });
});
