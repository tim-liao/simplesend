import express from "express";
const router = express.Router();
import { wrapAsync } from "../../util/util.js";
import {
  sentmail,
  authenticationApiKey,
  sentrawmail,
  responseFromrawmailUploadToS3,
} from "../controller/sentmail_controller.js";
router.route("/sentmail").post(
  wrapAsync(authenticationApiKey),
  wrapAsync(sentmail)
  /* #swagger.description = 'let user send email'
  #swagger.responses[200] = { data: "successfully scheduled" }
   #swagger.responses[400] = { data: "Bad request parameters" }
    #swagger.responses[500] = { data: "Server error" }
  #swagger.requestBody＝  {
  description: "Parameters required to send an email",
  "@content": {
    "application/json": {
      schema: {
        required: [
          "user_id",
          "nameFrom",
          "emailTo",
          "emailSubject",
          "emailBodyType",
          "emailBodyContent",
          "trackingOpen",
          "trackingClick",
        ],
        type: "object",
        properties: {
          user_id: {
            type: "integer",
            example: 1,
          },
          nameFrom: {
            type: "string",
            example: "example.cpm",
          },
          emailTo: {
            type: "string",
            example: "fasdf@gmail.com",
          },
          emailBcc: {
            type: "string",
            example: "fasdf@gmail.com",
          },
          emailCc: {
            type: "string",
            example: "fasdf@gmail.com",
          },
          emailReplyTo: {
            type: "string",
            example: "fasdf@gmail.com",
          },
          emailSubject: {
            type: "string",
            example: "hahaha",
          },
          emailBodyType: {
            type: "string",
            enum: ["text", "html"],
            example: "text",
          },
          emailBodyContent: {
            type: "string",
            example: "text",
          },
          trackingOpen: {
            type: "string",
            enum: ["yes", "no"],
            example: "text",
          },
          trackingClick: {
            type: "string",
            enum: ["yes", "no"],
            example: "text",
          },
          trackingLink: {
            type: "string",
            example: "text",
          },
        },
      },
    },
  },
};
  */
);
// 主打產品功能
// body帶著
// user_id:**,
//   nameFrom:**,
//   emailTo:**,
//   emailBcc:**,
//   emailCc:**,
//   emailReplyTo:**,
//   emailSubject:**,
//   emailBodyType:**(text html),
//   emailBodyContent:**,
//   trackingOpen:**,(yes no)
//   trackingClick:** (yes no)
// }
// 並且query帶著?APIKEY=**，即可進行寄件
router.route("/sentrawmail").post(
  wrapAsync(authenticationApiKey),
  wrapAsync(sentrawmail)
  /* #swagger.description = 'let user send email with attachment and get url to upload attachment to my place'
  #swagger.responses[200] = { data: { url:'URL', attachmentId:'ATTACHMENT_NAME' } }
  */
);
// 和上面只差在有附件，還有寄件方式不一樣
router.route("/responseFromrawmailUploadToS3").post(
  wrapAsync(authenticationApiKey),
  wrapAsync(responseFromrawmailUploadToS3)
  /* #swagger.description = 'if upload successfully, send 200 response to user'
  #swagger.responses[200] = { data: "successfully scheduled" }
  */
);
export default router;
