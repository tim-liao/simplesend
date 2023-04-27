import express from "express";
const router = express.Router();
import { wrapAsync, authentication } from "../../util/util.js";
import {
  getUserEmailHistory,
  getSuccessRate,
  getTrackingOpenEmailCountRate,
  getUserSentEmailqty,
  getUserSendEmailLog,
  getTrackingClickEmailInfor,
  getSuccessDeliveryRate,
  getUserSendEmailBounceLog,
} from "../controller/email_history_controller.js";
router
  .route("/getemailhistory")
  .post(wrapAsync(authentication), wrapAsync(getUserEmailHistory));
// req.body:{"userId":1,"startTime":"2023-04-04 00:00:00","endTime":"2023-04-06 13:00:00"}
// res.body:{ "data": { "2023-04-04": 14, "2023-04-05": 3,"2023-04-06": 5}}

router
  .route("/getsuccessrate")
  .post(wrapAsync(authentication), wrapAsync(getSuccessRate));
// req.body:{"userId":1}
// res.body:{"data": "37.50%"}

router
  .route("/gettrackingopenemailcountrate")
  .post(wrapAsync(authentication), wrapAsync(getTrackingOpenEmailCountRate));

// req.body:{"userId":1}
// res.body:{"data": "37.50%"}

router
  .route("/getusersentemailcount")
  .post(wrapAsync(authentication), wrapAsync(getUserSentEmailqty));
// req.body:{"userId":1}
// res.body:{"data":"count": 35}

router
  .route("/getUserSendEmailMessage")
  .post(wrapAsync(authentication), wrapAsync(getUserSendEmailLog));
// req.body:{"userId":1,"startTime":"2023-04-04 00:00:00","endTime":"2023-04-06 13:00:00"}
// res.body:{{"data": [{"recipient_email": "test", "time": "2023-04-04 06:41:44","email_subject": "999999","error_status": 400, "error_log": "Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: 456@gmail.com"},...}
router
  .route("/getUserSendEmailBounceMessage")
  .post(wrapAsync(authentication), wrapAsync(getUserSendEmailBounceLog));
// req.body:{"userId":1}
// res.body:{{"data": [{"recipient_email": "test", "time": "2023-04-04 06:41:44","email_subject": "999999","error_status": 400, "error_log": "Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: 456@gmail.com"},...}
router
  .route("/gettrackingclickemailinfor")
  .post(wrapAsync(authentication), wrapAsync(getTrackingClickEmailInfor));

// req.body:{"userId":1}
// res.body:{
//     "data": {
//       "coutry": {
//           "TW": 16
//       },
//       "browser": {
//           "Chrome": 11,
//           "Mobile Safari": 5
//       },
//       "platform": {
//           "Macintosh": 6,
//           "Windows NT 10.0": 5,
//           "iPhone": 5
//       }
//   }
// }

router
  .route("/getsuccessdeliveryrate")
  .post(wrapAsync(authentication), wrapAsync(getSuccessDeliveryRate));
// req.body:{"userId":1}
// res.body:{"data": "37.50%"}
export default router;
