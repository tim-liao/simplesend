import express from "express";
const router = express.Router();
import { wrapAsync } from "../../util/util.js";
import {
  sentmail,
  authenticationApiKey,
  sentrawmail,
  responseFromrawmailUploadToS3,
} from "../controller/sentmail_controller.js";
router
  .route("/sentmail")
  .post(wrapAsync(authenticationApiKey), wrapAsync(sentmail));
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
router
  .route("/sentrawmail")
  .post(wrapAsync(authenticationApiKey), wrapAsync(sentrawmail));
// 和上面只差在有附件，還有寄件方式不一樣
router
  .route("/sentrawmail")
  .post(
    wrapAsync(authenticationApiKey),
    wrapAsync(responseFromrawmailUploadToS3)
  );
export default router;
