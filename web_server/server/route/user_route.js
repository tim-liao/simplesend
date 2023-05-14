import express from "express";
const router = express.Router();
import { wrapAsync, authentication } from "../../util/util.js";
import {
  getUserProfile,
  userGetStringToStoreInDnsSetting,
  verifyUserDomainName,
  getAllUserDomainNameINfo,
  deleteUserDomainName,
  userSignUp,
  getUserName,
  userSignIn,
} from "../controller/user_controller.js";

router.route("/user").get(wrapAsync(authentication), wrapAsync(getUserProfile));

router
  .route("/user/dns/settingstring")
  .post(wrapAsync(authentication), wrapAsync(userGetStringToStoreInDnsSetting));

router
  .route("/user/dns/verify")
  .post(wrapAsync(authentication), wrapAsync(verifyUserDomainName));

router
  .route("/user/dns")
  .get(wrapAsync(authentication), wrapAsync(getAllUserDomainNameINfo));

router
  .route("/user/dns/domainname")
  .delete(wrapAsync(authentication), wrapAsync(deleteUserDomainName));

router.route("/user/signup").post(wrapAsync(userSignUp));

router.route("/user/signin").post(wrapAsync(userSignIn));

router
  .route("/user/name")
  .get(wrapAsync(authentication), wrapAsync(getUserName));

export default router;
