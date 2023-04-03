import dotenv from "dotenv";
import { putINMQ } from "../model/sentmail_model.js";
dotenv.config();

export async function sentmail(req, res) {
  const { email, yourname, text, html, yourSubject } = req.body;
  if (!(text || html)) {
    const err = new Error();
    err.stack = "your request miss content";
    err.status = 400;
    throw err;
  }
  if (text && html) {
    const err = new Error();
    err.stack = "your request cannot contain both text and html";
    err.status = 400;
    throw err;
  }
  if (!email || !yourname || !yourSubject) {
    const err = new Error();
    err.stack = "your request miss something";
    err.status = 400;
    throw err;
  }
  //TODO:把使用者的寄件資料塞到queue裡面(還沒做會員認證)
  let sendemailInfor = { email, yourname, yourSubject };
  if (text) {
    sendemailInfor["text"] = text;
  } else if (html) {
    sendemailInfor["html"] = html;
  }
  sendemailInfor = JSON.stringify(sendemailInfor);
  putINMQ(sendemailInfor);
  //TODO:回傳新的api key（要做一次性登入的狀況，放進排程）

  // let messageBody;
  // if (text) {
  //   messageBody = {
  //     Html: {
  //       Charset: "UTF-8",
  //       Data: `${text}<img src="${process.env.ADRESS}/a.png?id=465">`,
  //     },
  //     //   Text: {
  //     //     Charset: "UTF-8",
  //     //     Data: text,
  //     //   },
  //   };
  // } else if (html) {
  //   messageBody = {
  //     Html: {
  //       Charset: "UTF-8",
  //       Data: html + `<img src="${process.env.ADRESS}/a.png?id=465">`,
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
  // let data;
  // try {
  //   data = await client.send(command);
  // } catch (e) {
  //   console.error(e["$metadata"].httpStatusCode, e);
  //   throw e;
  // }

  res.status(200).send({ data: "successfully scheduled" });
}
