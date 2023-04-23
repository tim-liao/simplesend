import express from "express";
const router = express.Router();

import bodyParser from "body-parser";
import { wrapAsync, authentication } from "../../util/util.js";
import { sns } from "../controller/sns_controller.js";
router.route("/sns").post(bodyParser.text(), wrapAsync(sns));
export default router;
