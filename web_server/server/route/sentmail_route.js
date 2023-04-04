import express from "express";
const router = express.Router();
import wrapAsync from "../../util/util.js";
import {
  sentmail,
  authenticationApiKey,
  genrateapikey,
} from "../controller/sentmail_controller.js";
router
  .route("/sentmail")
  .post(
    wrapAsync(authenticationApiKey),
    wrapAsync(sentmail),
    wrapAsync(genrateapikey)
  );
// 主打產品功能
// body帶著{
// "email": **,
// "yourname":**",
// "text":**,
// "yourSubject":**,
// "user_id":**
// }
// 並且query帶著?APIKEY=**，即可進行寄件，寄件成功會回傳新的api key
export default router;
