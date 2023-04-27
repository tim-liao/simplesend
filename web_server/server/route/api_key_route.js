import express from "express";
const router = express.Router();
import { wrapAsync, authentication } from "../../util/util.js";
import {
  getnewestapikey,
  generatenewapikey,
  getAllActiveApiKeyWithExpiredTime,
} from "../controller/api_key_controller.js";
router.route("/getnewestapikey").post(
  wrapAsync(authentication),
  wrapAsync(getnewestapikey)
  /* #swagger.responses[200] = {
            description: {data: 'API_KEY'},
    } */
);
// body帶著"email"，透過這個route可以拿到資料庫的apikey，有過期會生成一個新的鑰匙給他，預計會顯示在會員資料頁面

router.route("/generatenewapikey").post(
  wrapAsync(authentication),
  wrapAsync(generatenewapikey)
  /* #swagger.responses[200] = {
            description: {data: 'API_KEY'},
    } */
);
// body帶著"email"，透過這個route會生成新的api key並且覆蓋舊的api key（舊的key可以放七天還可以使用）

router.route("/getAllActiveApiKeyWithExpiredTime").post(
  wrapAsync(authentication),
  wrapAsync(getAllActiveApiKeyWithExpiredTime)
  /* #swagger.responses[200] = {
            description: {data: [{api_key:"API_KEY",expired_time: "2023-05-01 14:43:50.000"},{api_key:"API_KEY",expired_time: "2024-04-23 14:43:50.000"}]}} */
);
// body帶著"email"，可以拿到所有目前可用的apikey包含過期時間
export default router;
