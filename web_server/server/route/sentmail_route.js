import express from "express";
const router = express.Router();
import wrapAsync from "../../util/util.js";
import {
  sentmail,
  authenticationApiKey,
} from "../controller/sentmail_controller.js";
router
  .route("/sentmail")
  .post(wrapAsync(authenticationApiKey), wrapAsync(sentmail));
// 主打產品功能
// body帶著{
// "email": **,
// "yourname":**",
// "text":**,
// "yourSubject":**,
// "user_id":**
// }
// 並且query帶著?APIKEY=**，即可進行寄件
// 這邊還要檢查old_api_key＿list七天內有沒有對方的api key，如果對方帶舊的也可以用，但會回傳即將刪除的資訊給他
export default router;
