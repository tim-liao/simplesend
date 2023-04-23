import express from "express";
const router = express.Router();
import { wrapAsync, authentication } from "../../util/util.js";
import { sns } from "../controller/sns_controller.js";
router.route("/sns").get(wrapAsync(sns));
export default router;
