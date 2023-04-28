import express from "express";
const router = express.Router();

import bodyParser from "body-parser";
import { wrapAsync, authentication } from "../../util/util.js";
import { sns } from "../controller/sns_controller.js";
router.route("/sns").post(
  bodyParser.text(),
  wrapAsync(sns)
  /* #swagger.description = 'let SNS notify the mail-sending-info when get response from recipient mail server'
  #swagger.responses[200] ={}
    	#swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/definitions/User"
                    }  
                },
                "application/xml": {
                    schema: {
                        $ref: "#/definitions/sample"
                    }  
                }
            }
        } 
    */
);
export default router;
