import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();
const awsConfig = AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export default awsConfig;
