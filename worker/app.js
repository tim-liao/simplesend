import amqp from "amqplib/callback_api.js";
import { Base64 } from "js-base64";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
import client from "./model/ses_config.js";
import {
  insertEmailInforDefaultStatusIsFailed,
  insertFailedEmailInfor,
  updateFailedEmailStatusBeSuccess,
} from "./model/sql_model.js";
import moment from "moment";
dotenv.config();
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
        let originalSendEmailInformation = msg.content.toString();
        // console.log(originalSendEmailInformation);
        //TODO:把東西寄出去
        try {
          originalSendEmailInformation = JSON.parse(
            originalSendEmailInformation
          );
        } catch (e) {
          const err = new Error("cannot transform to JSON");
          err.stack = "cannot transform to JSON";
          err.status = 500;
          console.log(e);
        }

        // console.log(" [x] Received %s", originalSendEmailInformation);
        const { email, yourname, text, html, yourSubject, userId } =
          originalSendEmailInformation;
        let now = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Taipei",
        });
        const time = moment(now, "M/D/YYYY hh:mm:ss a").format(
          "YYYY-MM-DD HH:mm:ss"
        );
        console.log(time);
        let autoId;
        try {
          autoId = await insertEmailInforDefaultStatusIsFailed(
            userId,
            yourSubject,
            time
          );
        } catch (e) {
          const err = new Error(
            "cannot insertEmailInforDefalutStatusIsFailed in sql"
          );
          err.stack = "cannot insertEmailInforDefalutStatusIsFailed in sql";
          err.status = 500;
          console.log(e);
        }
        console.log(autoId);
        let base64UTF8EncodedAutoId = Base64.encode(`${autoId}`);
        let messageBody;
        console.log(
          `${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedAutoId}`
        );
        if (text) {
          messageBody = {
            Html: {
              Charset: "UTF-8",
              Data: `${text}<img src="${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedAutoId}">`,
            },
          };
        } else if (html) {
          messageBody = {
            Html: {
              Charset: "UTF-8",
              Data:
                html +
                `<img src="${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedAutoId}">`,
            },
          };
        }
        const params = {
          Destination: {
            ToAddresses: [email],
          },
          Message: {
            Body: messageBody,

            Subject: {
              Charset: "UTF-8",
              Data: yourSubject,
            },
          },
          Source: `${yourname}${process.env.FROM_EMAIL}`,
        };
        const command = new SendEmailCommand(params);
        //TODO:把回傳的資料（錯誤訊息,成功訊息）放到資料庫
        // TODO:失敗補寄會直接在這裡做回圈，經過五次寄件失敗就會記錄到errlog資料庫裡面
        let data;
        let count = 0;
        let errorStatus;
        let errorLog;
        async function myFunction() {
          try {
            data = await client.send(command);
          } catch (e) {
            errorStatus = e["$metadata"].httpStatusCode;
            errorLog = e.message;
            console.error(e["$metadata"].httpStatusCode, e.message);
          }

          count++;
          console.log(count);
          if (!data && count < 5) {
            setTimeout(myFunction, count * 2000);
          } else if (data && data["$metadata"].httpStatusCode == 200) {
            // 有data且status為200代表寄件成功，可以直接更新寄件狀態到資料庫
            // console.log(data);
            try {
              await updateFailedEmailStatusBeSuccess(autoId);
            } catch (e) {
              const err = new Error(
                "cannot updateFailedEmailStatusBeSuccess in sql"
              );
              err.stack = "cannot updateFailedEmailStatusBeSuccess in sql";
              err.status = 500;
            }
          } else if (count == 5 && !data) {
            // 如果已經重複４次結束都還沒有data的話，就要把錯誤訊息及錯誤狀態存到資料庫
            try {
              await insertFailedEmailInfor(autoId, errorStatus, errorLog);
            } catch (e) {
              console.log(e);
              const err = new Error("cannot insertFailedEmailInfors in sql");
              err.stack = "cannot insertFailedEmailInfors in sql";
              err.status = 500;
            }
          } else if (data && data["$metadata"].httpStatusCode != 200) {
            // 有data但status不是200感覺怪怪的，還沒有碰過這個狀況，但如果碰到的話就把他歸類在error裡面
            let message =
              data.message || "send successfully but something worong from SES";
            try {
              await insertFailedEmailInfor(
                autoId,
                data["$metadata"].httpStatusCode,
                message
              );
            } catch (e) {
              const err = new Error("cannot insertFailedEmailInfors in sql");
              err.stack = "cannot insertFailedEmailInfors in sql";
              err.status = 500;
            }
          }
        }

        // 在第一次調用時，第一次0秒後執行
        setTimeout(myFunction, 0);
      },
      {
        noAck: true,
      }
    );
  });
});
