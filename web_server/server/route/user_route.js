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

router.route("/getuserprofile").post(
  wrapAsync(authentication),
  wrapAsync(getUserProfile)
  /* #swagger.description = 'get user info'
  #swagger.responses[200] = {"data":{
    "id": 1,
    "name": "aaa",
    "email": "aaa@gmail.com"
}}
  */
);
// req.body:{"userId":1}
// res.body:{"data":{
//     "id": 1,
//     "name": "aaa",
//     "email": "aaa@gmail.com"
// }}

router.route("/userGetStringToStoreInDnsSetting").post(
  wrapAsync(authentication),
  wrapAsync(userGetStringToStoreInDnsSetting)
  /* #swagger.description = 'get setting string to let user verify the domain name which will be used in sending email'
  #swagger.responses[200] = {"data":{
    verifyString:'dsfakjdlsfgodisfjdsnvfdls'
}}
  */
);
// req.body:{"userId":1;'domainName':'esdf.io'}
// res.body:{"data":{
// verifyString:'sadfuhaejklseklrcwargeiuwfxerwcf'
// }}

router.route("/verifyUserDomainName").post(
  wrapAsync(authentication),
  wrapAsync(verifyUserDomainName)
  /* #swagger.description = 'verify user domain name '
  #swagger.responses[200] = {"data":{
    verifyStatus: "success"
}}
  */
);
// req.body:{"userId":1;'domainName':'esdf.io'}
// res.body:{{ data: { verifyStatus: "success" } }}

router.route("/getAllUserDomainNameINfor").post(
  wrapAsync(authentication),
  wrapAsync(getAllUserDomainNameINfor)
  /* #swagger.description = 'get all user domain name , setting string and status'
  #swagger.responses[200] ={ data: [ {domain_name:'asdf.io',"setting_string": "wy5rtyvbtegrhvetyghrrevyhtbvbhyetbdvhty", "verify_status": "success"},{domain_name:'qwerhjk.com',"setting_string": "wy5rtyvbtegrhvetyghrrevyhtbvbhyetbdvhty", "verify_status": "failed"} ] }
  */
);
// req.body:{"userId":1}
// res.body:{{ data: [ {domain_name:'asdf.io',"setting_string": "wy5rtyvbtegrhvetyghrrevyhtbvbhyetbdvhty", "verify_status": "success"},{domain_name:'qwerhjk.com',"setting_string": "wy5rtyvbtegrhvetyghrrevyhtbvbhyetbdvhty", "verify_status": "failed"} ] }}

router.route("/deleteUserDomainName").post(
  wrapAsync(authentication),
  wrapAsync(deleteUserDomainName)
  /* #swagger.description = 'let user to delete domain name'
  #swagger.responses[200] ={ data: 'successfully deleted' }
  */
);
// req.body:{"userId":1;'domainName':'esdf.io'}
// res.body:{{ data: 'successfully deleted' }}
// 但我是假刪除

router.route("/userSignUp").post(
  wrapAsync(userSignUp)
  /* #swagger.description = 'let user register to our website'
  #swagger.responses[200] ={  "data": {
      "access_token": "456rstghersg45e6rsh2df3gh45rtbg",
      "acces_expired": 3600
  },
  "user": {
      "id": 7,
      "name": "apple",
      "email": "4564564@gmail.com"
  }}
  */
);
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

router.route("/userSignIn").post(
  wrapAsync(userSignIn)
  /* #swagger.description = 'let user log in to our website'
  #swagger.responses[200] ={  "data": {
      "access_token": "456rstghersg45e6rsh2df3gh45rtbg",
      "acces_expired": 3600
  },
  "user": {
      "id": 7,
      "name": "apple",
      "email": "4564564@gmail.com"
  }}
  
  */
);
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

router.route("/getusername").post(
  wrapAsync(authentication),
  wrapAsync(getUserName)
  /* #swagger.description = 'get user name '
  #swagger.responses[200] ={"data": {userName:'name'}}
  */
);

export default router;
