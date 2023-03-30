import { SES } from "@aws-sdk/client-ses";
import { nextTick } from "process";
import awsConfig from "../model/sentmail_model.js";

export async function sentmail(req, res) {
  const { email, yourname, text, yourSubject } = req.body;
  const params = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: "HTML_FORMAT_BODY",
        },
        Text: {
          Charset: "UTF-8",
          Data: text,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: yourSubject,
      },
    },
    Source: `${yourname}@simple-send.online`,
  };
  if (!email || !yourname || !text || !yourSubject) {
    const err = new Error();
    err.stack = "your request miss something";
    err.status = 500;
    throw err;
  }
  const sendPromise = new SES({ apiVersion: "2010-12-01" }).sendEmail(params);

  sendPromise
    .then(function (data) {
      console.log("data", data.MessageId);
    })
    .catch(function (err) {
      console.error("err", err, err.stack);
    });
  console.log(email, yourname, text, yourSubject);
  res.status(200).send({ data: [] });
}
