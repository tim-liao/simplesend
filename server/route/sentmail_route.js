import express from "express";
const router = express.Router();
import wrapAsync from "../../util/util.js";
import { sentmail } from "../controller/sentmail_controller.js";
router.route("/sentmail").get(wrapAsync(sentmail));

export default router;
