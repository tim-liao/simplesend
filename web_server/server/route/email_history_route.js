import express from "express";
const router = express.Router();
import { wrapAsync, authentication } from "../../util/util.js";
import {
  getUserEmailHistoryQty,
  getSuccessRate,
  getTrackingOpenEmailCountRate,
  getUserSentEmailQty,
  getUserSendEmailLog,
  getTrackingClickEmailInfo,
  getSuccessDeliveryRate,
  getUserSendEmailBounceLog,
} from "../controller/email_history_controller.js";
router
  .route("/dashboard/emails/dailycount")
  .post(wrapAsync(authentication), wrapAsync(getUserEmailHistoryQty));

router
  .route("/dashboard/emails/sendingrate")
  .get(wrapAsync(authentication), wrapAsync(getSuccessRate));

router
  .route("/dashboard/emails/tracking/openingrate")
  .get(wrapAsync(authentication), wrapAsync(getTrackingOpenEmailCountRate));

router
  .route("/dashboard/emails/count")
  .get(wrapAsync(authentication), wrapAsync(getUserSentEmailQty));

router
  .route("/dashboard/emails")
  .post(wrapAsync(authentication), wrapAsync(getUserSendEmailLog));

router
  .route("/dashboard/bounce")
  .get(wrapAsync(authentication), wrapAsync(getUserSendEmailBounceLog));

router
  .route("/dashboard/emails/tracking/info")
  .get(wrapAsync(authentication), wrapAsync(getTrackingClickEmailInfo));

router
  .route("/dashboard/emails/deliveredrate")
  .get(wrapAsync(authentication), wrapAsync(getSuccessDeliveryRate));

export default router;
