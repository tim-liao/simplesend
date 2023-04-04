import express from "express";
const router = express.Router();
import wrapAsync from "../../util/util.js";
import { getapikey } from "../controller/api_key_controller.js";
router.route("/getapikey").post(wrapAsync(getapikey));
// body帶著"email"，透過這個route可以拿到資料庫的apikey，有過期會生成一個新的鑰匙給他，預計會顯示在會員資料頁面
export default router;
