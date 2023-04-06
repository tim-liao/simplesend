import express from "express";
const router = express.Router();
import wrapAsync from "../../util/util.js";
import {
  getapikey,
  generatenewapikey,
} from "../controller/api_key_controller.js";
router.route("/getapikey").post(wrapAsync(getapikey));
// body帶著"email"，透過這個route可以拿到資料庫的apikey，有過期會生成一個新的鑰匙給他，預計會顯示在會員資料頁面

router.route("/generatenewapikey").post(wrapAsync(generatenewapikey));
// body帶著"email"，透過這個route會生成新的api key並且覆蓋舊的api key（舊的key可以放七天還可以使用）
export default router;
