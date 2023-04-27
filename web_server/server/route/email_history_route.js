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
router.route("/getemailhistory").post(
  wrapAsync(authentication),
  wrapAsync(getUserEmailHistory)
  /* #swagger.description = 'get each day send email count by time interval'
  #swagger.responses[200] = { "data": { "2023-04-04": 14, "2023-04-05": 3,"2023-04-06": 5}}
  */
);
// req.body:{"userId":1,"startTime":"2023-04-04 00:00:00","endTime":"2023-04-06 13:00:00"}
// res.body:{ "data": { "2023-04-04": 14, "2023-04-05": 3,"2023-04-06": 5}}

router.route("/getsuccessrate").post(
  wrapAsync(authentication),
  wrapAsync(getSuccessRate)
  /* #swagger.description = 'get success rate to send email from my server'
  #swagger.responses[200] = {"data": "37.50%"}
  */
);
// req.body:{"userId":1}
// res.body:{"data": "37.50%"}

router.route("/gettrackingopenemailcountrate").post(
  wrapAsync(authentication),
  wrapAsync(getTrackingOpenEmailCountRate)
  /* #swagger.description = 'get tracking open count rate'
  #swagger.responses[200] = {"data": "37.50%"}
  */
);

// req.body:{"userId":1}
// res.body:{"data": "37.50%"}

router.route("/getusersentemailcount").post(
  wrapAsync(authentication),
  wrapAsync(getUserSentEmailqty)
  /* #swagger.description = 'get user sent email count since creating the member'
  #swagger.responses[200] ={"data":{"count": 35}}
  */
);
// req.body:{"userId":1}
// res.body:{"data":{"count": 35}}

router.route("/getUserSendEmailMessage").post(
  wrapAsync(authentication),
  wrapAsync(getUserSendEmailLog)
  /* #swagger.description = 'get user send email detail and status '
  #swagger.responses[200] ={"data": [{"recipient_email": "test", "time": "2023-04-04 06:41:44","email_subject": "999999","error_status": 400, "error_log": "Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: 456@gmail.com",andsoon:"and so on"}]}
  */
);

// req.body:{"userId":1,"startTime":"2023-04-04 00:00:00","endTime":"2023-04-06 13:00:00"}
// res.body:{{"data": [{"recipient_email": "test", "time": "2023-04-04 06:41:44","email_subject": "999999","error_status": 400, "error_log": "Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: 456@gmail.com"},"and so on":"and so on"}]}
router.route("/getUserSendEmailBounceMessage").post(
  wrapAsync(authentication),
  wrapAsync(getUserSendEmailBounceLog)
  /* #swagger.description = 'get all bounced recipients email address ,bounced message and created time '
  #swagger.responses[200] ={"data": [{email_address:'example@asa.com',action:"failed",action_message:"reject from mail server",created_dt:"2024-04-23 14:43:50.000"}]}
  */
);
// req.body:{"userId":1}
// res.body:{{"data": [{"recipient_email": "test", "time": "2023-04-04 06:41:44","email_subject": "999999","error_status": 400, "error_log": "Email address is not verified. The following identities failed the check in region AP-NORTHEAST-1: 456@gmail.com"},...}
router.route("/gettrackingclickemailinfor").post(
  wrapAsync(authentication),
  wrapAsync(getTrackingClickEmailInfor)
  /* #swagger.description = 'get user tracking click and recipient info'
  #swagger.responses[200] ={
  "coutry": {
 "TW": 16
 },
      "browser": {
          "Chrome": 11,
          "Mobile Safari": 5
      },
      "platform": {
          "Macintosh": 6,
          "Windows NT 10.0": 5,
          "iPhone": 5
      }
  }
  */
);

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

router.route("/getsuccessdeliveryrate").post(
  wrapAsync(authentication),
  wrapAsync(getSuccessDeliveryRate)
  /* #swagger.description = 'get rate from email address when get "delivery" response from recipient mail server'
  #swagger.responses[200] = {"data": "37.50%"}
  */
);
// req.body:{"userId":1}
// res.body:{"data": "37.50%"}
export default router;
