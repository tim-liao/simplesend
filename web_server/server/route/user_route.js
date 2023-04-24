import express from "express";
const router = express.Router();
import { wrapAsync, authentication } from "../../util/util.js";
import {
  getUserProfile,
  userGetStringToStoreInDnsSetting,
  verifyUserDomainName,
  getAllUserDomainNameINfor,
  deleteUserDomainName,
  userSignUp,
  getUserName,
  userSignIn,
} from "../controller/user_controller.js";

router
  .route("/getuserprofile")
  .post(wrapAsync(authentication), wrapAsync(getUserProfile));
// req.body:{"userId":1}
// res.body:{"data":{
//     "id": 1,
//     "name": "aaa",
//     "email": "aaa@gmail.com"
// }}

router
  .route("/userGetStringToStoreInDnsSetting")
  .post(wrapAsync(authentication), wrapAsync(userGetStringToStoreInDnsSetting));
// req.body:{"userId":1;'domainName':'esdf.io'}
// res.body:{"data":{
// verifyString:'sadfuhaejklseklrcwargeiuwfxerwcf'
// }}

router
  .route("/verifyUserDomainName")
  .post(wrapAsync(authentication), wrapAsync(verifyUserDomainName));
// req.body:{"userId":1;'domainName':'esdf.io'}
// res.body:{{ data: { verifyStatus: "success" } }}

router
  .route("/getAllUserDomainNameINfor")
  .post(wrapAsync(authentication), wrapAsync(getAllUserDomainNameINfor));
// req.body:{"userId":1}
// res.body:{{ data: [ {domain_name:'asdf.io',"setting_string": "wy5rtyvbtegrhvetyghrrevyhtbvbhyetbdvhty", "verify_status": "success"},{domain_name:'qwerhjk.com',"setting_string": "wy5rtyvbtegrhvetyghrrevyhtbvbhyetbdvhty", "verify_status": "failed"} ] }}

router
  .route("/deleteUserDomainName")
  .post(wrapAsync(authentication), wrapAsync(deleteUserDomainName));
// req.body:{"userId":1;'domainName':'esdf.io'}
// res.body:{{ data: 'successfully deleted' }}
// 但我是假刪除

router.route("/userSignUp").post(wrapAsync(userSignUp));
// req.body:{ "email":"efa@gmail.com", "password":"test", "name":"apple"}
// res.body:{
//     "data": {
//       "access_token": "456rstghersg45e6rsh2df3gh45rtbg",
//       "acces_expired": 3600
//   },
//   "user": {
//       "id": 7,
//       "name": "apple",
//       "email": "4564564@gmail.com"
//   }
// }

router.route("/userSignIn").post(wrapAsync(userSignIn));
// req.body:{ "email":"efa@gmail.com", "password":"test"}
// res.body:{
//     "data": {
//       "access_token": "456rstghersg45e6rsh2df3gh45rtbg",
//       "acces_expired": 3600
//   },
//   "user": {
//       "id": 7,
//       "name": "apple",
//       "email": "4564564@gmail.com"
//   }
// }

router
  .route("/getusername")
  .post(wrapAsync(authentication), wrapAsync(getUserName));

export default router;
