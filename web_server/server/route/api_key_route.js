import express from "express";
const router = express.Router();
import { wrapAsync, authentication } from "../../util/util.js";
import {
  generateNewApiKey,
  getAllActiveApiKeyWithExpiredTime,
} from "../controller/api_key_controller.js";

router
  .route("/apikey")
  .post(wrapAsync(authentication), wrapAsync(generateNewApiKey));

router
  .route("/apikey")
  .get(wrapAsync(authentication), wrapAsync(getAllActiveApiKeyWithExpiredTime));

export default router;
