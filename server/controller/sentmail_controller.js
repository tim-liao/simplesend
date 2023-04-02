import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
import client from "../model/sentmail_model.js";
dotenv.config();

export async function sentmail(req, res) {
  const { email, yourname, text, html, yourSubject } = req.body;
  if (!(text || html)) {
    const err = new Error();
    err.stack = "your request miss content";
    err.status = 400;
    throw err;
  }
  if (!email || !yourname || !yourSubject) {
    const err = new Error();
    err.stack = "your request miss something";
    err.status = 400;
    throw err;
  }
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
  let data;
  try {
    data = await client.send(command);
  } catch (e) {
    console.error(e["$metadata"].httpStatusCode, e);
    throw e;
  }
  //   console.log(yourSubject, data.MessageId);
  //   console.log(testaa);
  res
    .status(200)
    .send({ data: [{ yourSubject: yourSubject, testaa: data.MessageId }] });
}
