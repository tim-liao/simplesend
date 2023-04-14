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
} from "./model/sql_model.js";
import { generateTimeNow } from "./model/time_model.js";
import { transformToTrackedHTML } from "./model/transform_html_model.js";
import moment from "moment";
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
        // TODO:把東西從資料庫拿出來
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
        // TODO:把first_trigger_dt改成現在，並把狀態改成triggered
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
        //TODO:把東西寄出去
        console.log(allSendEmailInformation);
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
        // TODO:檢查emailBcc,emailCc,emailReplyTo是不是undfined，是得話就把這幾個欄位改成空值array
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
        // TODO:trackingOpen以及trackingClick對應後有四種狀況，來決定要不要塞入
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
            console.log("HTMLData", HTMLData);
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
        // TODO:把資料準備好做成params
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
        // TODO:如果東西整理好準備要寄送時就把資料庫得狀態改成pending
        console.log(messageBody);
        console.log(params);
        try {
          await updateSendEmailRequestStatus("pending", sendEmailId);
        } catch (e) {
          const err = new Error("cannot updateSendEmailRequestStatus in sql");
          err.stack = "cannot updateSendEmailRequestStatus in sql";
          err.status = 500;
          console.log(e);
        }
        const command = new SendEmailCommand(params);
        let data;
        let count = 0;
        let failedSendStatusCode;
        let failedSendMessage;
        async function myFunction() {
          let sendEmailLogId;
          let triggerTimeNow = generateTimeNow();
          let responseDT;
          try {
            // TODO:新增email log資料並說明trigger_dt以及同一個sendemailid的寄件次數
            sendEmailLogId = await insertDefaultSendEmailLog(
              sendEmailId,
              count,
              triggerTimeNow,
              triggerTimeNow,
              0,
              "default"
            );
          } catch (e) {
            const err = new Error("cannot insertDefaultSendEmailLog in sql");
            err.stack = "cannot insertDefaultSendEmailLog in sql";
            err.status = 500;
            console.log(e);
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
          // TODO:寄件成功就資料庫得狀態改成success，並紀錄回傳email log以及回傳時間紀錄到資料庫
          if (data && data["$metadata"].httpStatusCode == 200) {
            try {
              await updateSendEmailLog(
                sendEmailLogId,
                responseDT,
                200,
                "successfully send email"
              );
            } catch (e) {
              const err = new Error("cannot updateSendEmailLog in sql");
              err.stack = "cannot updateSendEmailLog in sql";
              err.status = 500;
              console.log(err);
            }
            try {
              await updateSendEmailRequestStatus("success", sendEmailId);
            } catch (e) {
              const err = new Error(
                "cannot updateSendEmailRequestStatus to success in sql"
              );
              err.stack =
                "cannot updateSendEmailRequestStatus to success in sql";
              err.status = 500;
              console.log(err);
            }
          } else if (!data && count < 5) {
            // TODO:寄件失敗但在補寄過程時，不需要變更資料庫寄件狀態，但要紀錄email log，並紀錄回傳時間到資料庫
            setTimeout(myFunction, count * 2000);
            try {
              await updateSendEmailLog(
                sendEmailLogId,
                responseDT,
                failedSendStatusCode,
                failedSendMessage
              );
            } catch (e) {
              console.log(e);
              const err = new Error("cannot updateSendEmailLog in sql");
              err.stack = "cannot updateSendEmailLog in sql";
              err.status = 500;
              console.log(err);
            }
          } else if (!data && count == 5) {
            // TODO:若是自動補寄完仍然失敗，變更資料庫寄件狀態為failed，並紀錄email log，並紀錄回傳時間到資料庫
            try {
              await updateSendEmailLog(
                sendEmailLogId,
                responseDT,
                failedSendStatusCode,
                failedSendMessage
              );
            } catch (e) {
              const err = new Error("cannot updateSendEmailLog in sql");
              err.stack = "cannot updateSendEmailLog in sql";
              err.status = 500;
              console.log(err);
            }
            try {
              await updateSendEmailRequestStatus("failed", sendEmailId);
            } catch (e) {
              const err = new Error(
                "cannot updateSendEmailRequestStatus to success in sql"
              );
              err.stack =
                "cannot updateSendEmailRequestStatus to success in sql";
              err.status = 500;
              console.log(err);
            }
          }
          // if (!data && count < 5) {
          // } else if (data && data["$metadata"].httpStatusCode == 200) {
          //   // 有data且status為200代表寄件成功，可以直接更新寄件狀態到資料庫
          //   // console.log(data);
          //   try {
          //     await updateFailedEmailStatusBeSuccess(autoId);
          //   } catch (e) {
          //     const err = new Error(
          //       "cannot updateFailedEmailStatusBeSuccess in sql"
          //     );
          //     err.stack = "cannot updateFailedEmailStatusBeSuccess in sql";
          //     err.status = 500;
          //   }
          //   updateDashboard(userId);
          // } else if (count == 5 && !data) {
          //   updateDashboard(userId);
          //   // 如果已經重複４次結束都還沒有data的話，就要把錯誤訊息及錯誤狀態存到資料庫
          //   try {
          //     await insertFailedEmailInfor(
          //       autoId,
          //       email,
          //       errorStatus,
          //       errorLog
          //     );
          //   } catch (e) {
          //     console.log(e);
          //     const err = new Error("cannot insertFailedEmailInfors in sql");
          //     err.stack = "cannot insertFailedEmailInfors in sql";
          //     err.status = 500;
          //   }
          // } else if (data && data["$metadata"].httpStatusCode != 200) {
          //   // 有data但status不是200感覺怪怪的，還沒有碰過這個狀況，但如果碰到的話就把他歸類在error裡面
          //   let message =
          //     data.message || "send successfully but something worong from SES";
          //   try {
          //     await insertFailedEmailInfor(
          //       autoId,
          //       data["$metadata"].httpStatusCode,
          //       message
          //     );
          //   } catch (e) {
          //     const err = new Error("cannot insertFailedEmailInfors in sql");
          //     err.stack = "cannot insertFailedEmailInfors in sql";
          //     err.status = 500;
          //   }
          // }
        }

        // let now = new Date().toLocaleString("en-US", {
        //   timeZone: "Asia/Taipei",
        // });
        // const time = moment(now, "M/D/YYYY hh:mm:ss a").format(
        //   "YYYY-MM-DD HH:mm:ss"
        // );
        // // console.log(time);
        // let autoId;
        // try {
        //   autoId = await insertEmailInforDefaultStatusIsFailed(
        //     userId,
        //     yourSubject,
        //     time
        //   );
        // } catch (e) {
        //   const err = new Error(
        //     "cannot insertEmailInforDefalutStatusIsFailed in sql"
        //   );
        //   err.stack = "cannot insertEmailInforDefalutStatusIsFailed in sql";
        //   err.status = 500;
        //   console.log(e);
        // }
        // console.log(autoId);
        // let base64UTF8EncodedAutoId = Base64.encode(`${autoId}`);
        // // let messageBody;
        // console.log(
        //   `${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedAutoId}`
        // );
        // if (text) {
        //   messageBody = {
        //     Html: {
        //       Charset: "UTF-8",
        //       Data: `${text}<img src="${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedAutoId}">`,
        //     },
        //   };
        // } else if (html) {
        //   messageBody = {
        //     Html: {
        //       Charset: "UTF-8",
        //       Data:
        //         html +
        //         `<img src="${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedAutoId}">`,
        //     },
        //   };
        // }
        // const params = {
        //   Destination: {
        //     ToAddresses: [email],
        //   },
        //   Message: {
        //     Body: messageBody,

        //     Subject: {
        //       Charset: "UTF-8",
        //       Data: yourSubject,
        //     },
        //   },
        //   Source: `${yourname}${process.env.FROM_EMAIL}`,
        // };
        // const command = new SendEmailCommand(params);
        //TODO:把回傳的資料（錯誤訊息,成功訊息）放到資料庫
        // TODO:失敗補寄會直接在這裡做回圈，經過五次寄件失敗就會記錄到errlog資料庫裡面
        // let data;
        // let count = 0;
        // let errorStatus;
        // let errorLog;
        // async function myFunction() {
        //   try {
        //     data = await client.send(command);
        //   } catch (e) {
        //     errorStatus = e["$metadata"].httpStatusCode;
        //     errorLog = e.message;
        //     console.error(e["$metadata"].httpStatusCode, e.message);
        //   }

        //   count++;
        //   console.log(count);
        //   if (!data && count < 5) {
        //     setTimeout(myFunction, count * 2000);
        //   } else if (data && data["$metadata"].httpStatusCode == 200) {
        //     // 有data且status為200代表寄件成功，可以直接更新寄件狀態到資料庫
        //     // console.log(data);
        //     try {
        //       await updateFailedEmailStatusBeSuccess(autoId);
        //     } catch (e) {
        //       const err = new Error(
        //         "cannot updateFailedEmailStatusBeSuccess in sql"
        //       );
        //       err.stack = "cannot updateFailedEmailStatusBeSuccess in sql";
        //       err.status = 500;
        //     }
        //     updateDashboard(userId);
        //   } else if (count == 5 && !data) {
        //     updateDashboard(userId);
        //     // 如果已經重複４次結束都還沒有data的話，就要把錯誤訊息及錯誤狀態存到資料庫
        //     try {
        //       await insertFailedEmailInfor(
        //         autoId,
        //         email,
        //         errorStatus,
        //         errorLog
        //       );
        //     } catch (e) {
        //       console.log(e);
        //       const err = new Error("cannot insertFailedEmailInfors in sql");
        //       err.stack = "cannot insertFailedEmailInfors in sql";
        //       err.status = 500;
        //     }
        //   } else if (data && data["$metadata"].httpStatusCode != 200) {
        //     // 有data但status不是200感覺怪怪的，還沒有碰過這個狀況，但如果碰到的話就把他歸類在error裡面
        //     let message =
        //       data.message || "send successfully but something worong from SES";
        //     try {
        //       await insertFailedEmailInfor(
        //         autoId,
        //         data["$metadata"].httpStatusCode,
        //         message
        //       );
        //     } catch (e) {
        //       const err = new Error("cannot insertFailedEmailInfors in sql");
        //       err.stack = "cannot insertFailedEmailInfors in sql";
        //       err.status = 500;
        //     }
        //   }
        // }

        // 在第一次調用時，第一次0秒後執行
        setTimeout(myFunction, 0);
      },
      {
        noAck: true,
      }
    );
  });
});
