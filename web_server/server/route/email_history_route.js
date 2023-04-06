import express from "express";
const router = express.Router();
import wrapAsync from "../../util/util.js";
import {
  getUserEmailHistory,
  getSuccessRate,
  getTrackingEmailCountRate,
} from "../controller/email_history_controller.js";
router.route("/getemailhistory").post(wrapAsync(getUserEmailHistory));
// req.body:{"userId":1,"startTime":"2023-04-04 00:00:00","endTime":"2023-04-06 13:00:00"}
// res.body:{ "data": { "2023-04-04": 14, "2023-04-05": 3,"2023-04-06": 5}}

router.route("/getsuccessrate").post(wrapAsync(getSuccessRate));
// req.body:{"userId":1}
// res.body:{"data": "37.50%"}

router
  .route("/gettrackingemailcountrate")
  .post(wrapAsync(getTrackingEmailCountRate));

// req.body:{"userId":1}
// res.body:{"data": "37.50%"}
export default router;
