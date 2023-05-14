import { SESClient } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
dotenv.config();

const client = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
export default client;
