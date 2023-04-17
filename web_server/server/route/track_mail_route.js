import express from "express";
const router = express.Router();
import { wrapAsync } from "../../util/util.js";
import { trackMail } from "../controller/track_mail_controller.js";

export let trackMailClick = wrapAsync(trackMail);
