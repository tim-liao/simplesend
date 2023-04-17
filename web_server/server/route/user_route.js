import express from "express";
const router = express.Router();
import wrapAsync from "../../util/util.js";
import {
  getUserProfile,
  userGetStringToStoreInDnsSetting,
  verifyUserDomainName,
  getAllUserDomainNameINfor,
  deleteUserDomainName,
} from "../controller/user_controller.js";

router.route("/getuserprofile").post(wrapAsync(getUserProfile));
// req.body:{"userId":1}
// res.body:{"data":{
//     "id": 1,
//     "name": "aaa",
//     "email": "aaa@gmail.com"
// }}

router
  .route("/userGetStringToStoreInDnsSetting")
  .post(wrapAsync(userGetStringToStoreInDnsSetting));
// req.body:{"userId":1;'domainName':'esdf.io'}
// res.body:{"data":{
// verifyString:'sadfuhaejklseklrcwargeiuwfxerwcf'
// }}

router.route("/verifyUserDomainName").post(wrapAsync(verifyUserDomainName));
// req.body:{"userId":1;'domainName':'esdf.io'}
// res.body:{{ data: { verifyStatus: "success" } }}

router
  .route("/getAllUserDomainNameINfor")
  .post(wrapAsync(getAllUserDomainNameINfor));
// req.body:{"userId":1}
// res.body:{{ data: [ {domain_name:'asdf.io',"setting_string": "wy5rtyvbtegrhvetyghrrevyhtbvbhyetbdvhty", "verify_status": "success"},{domain_name:'qwerhjk.com',"setting_string": "wy5rtyvbtegrhvetyghrrevyhtbvbhyetbdvhty", "verify_status": "failed"} ] }}

router.route("/deleteUserDomainName").post(wrapAsync(deleteUserDomainName));
// req.body:{"userId":1;'domainName':'esdf.io'}
// res.body:{{ data: 'successfully deleted' }}
// 但我是假刪除
export default router;
