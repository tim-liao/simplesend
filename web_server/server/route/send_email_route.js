import express from "express";
const router = express.Router();
import { wrapAsync } from "../../util/util.js";
import {
  sentEmail,
  authenticationApiKey,
  sentRawEmail,
  responseFromRawEmailUploadToS3,
} from "../controller/send_email_controller.js";
router
  .route("/email/send")
  .post(wrapAsync(authenticationApiKey), wrapAsync(sentEmail));

router
  .route("/email/send/attachment")
  .post(wrapAsync(authenticationApiKey), wrapAsync(sentRawEmail));

router
  .route("/email/send/attachment/attachmentid")
  .post(
    wrapAsync(authenticationApiKey),
    wrapAsync(responseFromRawEmailUploadToS3)
  );
export default router;
