import express from "express";
const router = express.Router();
import wrapAsync from "../../util/util.js";
import { getUserProfile } from "../controller/user_controller.js";

router.route("/getuserprofile").post(wrapAsync(getUserProfile));
// req.body:{"userId":1}
// res.body:{"data":{
//     "id": 1,
//     "name": "aaa",
//     "email": "aaa@gmail.com"
// }}
export default router;
