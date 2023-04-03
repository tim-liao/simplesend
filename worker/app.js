import amqp from "amqplib/callback_api.js";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
import client from "./sql_config.js";
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
        //TODO:把東西寄出去
        try {
          originalSendEmailInformation = JSON.parse(
            originalSendEmailInformation
          );
        } catch (e) {
          // console.log(e);
        }

        // console.log(" [x] Received %s", originalSendEmailInformation);
        const { email, yourname, text, html, yourSubject } =
          originalSendEmailInformation;
        let messageBody;
        if (text) {
          messageBody = {
            Html: {
              Charset: "UTF-8",
              Data: `${text}<img src="${process.env.ADRESS}/a.png?id=465">`,
            },
            //   Text: {
            //     Charset: "UTF-8",
            //     Data: text,
            //   },
          };
        } else if (html) {
          messageBody = {
            Html: {
              Charset: "UTF-8",
              Data: html + `<img src="${process.env.ADRESS}/a.png?id=465">`,
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
        let data;
        try {
          data = await client.send(command);
        } catch (e) {
          console.error(e["$metadata"].httpStatusCode, e.message);
        }
        console.log(data);
      },
      {
        noAck: true,
      }
    );
  });
});
