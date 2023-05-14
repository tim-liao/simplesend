import amqp from "amqplib";
import jwt from "jsonwebtoken";
import connectionPool from "../../util/mysql_config.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../../util/s3_config.js";
import moment from "moment";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
dotenv.config();

export async function createEmailRequest(
  userId,
  nameFrom,
  emailTo,
  emailBcc,
  emailCc,
  emailReplyTo,
  emailSubject,
  emailBodyType,
  emailBodyContent,
  trackingOpen,
  trackingClick,
  createDT,
  sendStatus,
  firstTriggerDT,
  attachment,
  trackingLink
) {
  let [result] = await connectionPool.query(
    `Insert into  send_email_list (user_id,name_from,email_to,email_bcc,email_cc,email_reply_to,email_subject,email_body_type,email_body_content,tracking_open,tracking_click,created_dt,send_status,first_trigger_dt,attachment,tracking_link) VALUES  (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      userId,
      nameFrom,
      emailTo,
      emailBcc,
      emailCc,
      emailReplyTo,
      emailSubject,
      emailBodyType,
      emailBodyContent,
      trackingOpen,
      trackingClick,
      createDT,
      sendStatus,
      firstTriggerDT,
      attachment,
      trackingLink,
    ]
  );
  return result;
}

export async function putInMQ(messageInput) {
  const connection = await amqp.connect("amqp://localhost?heartbeat=30");
  const channel = await connection.createChannel();
  let queue = "sendemail";
  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(messageInput)));

  console.log(" [x] Sent %s", messageInput);

  setTimeout(() => {
    connection.close();
  }, 500);
}
export async function verifyApiKey(key) {
  const SECRET = process.env.APP_KEY_SECRET;
  const check = jwt.verify(key, SECRET);
  return check;
}

export async function selectApiKey(id) {
  let [result] = await connectionPool.query(
    `SELECT API_key FROM  api_key_list WHERE user_id = ?`,
    [id]
  );
  return result;
}

export async function selectApiKeyOldList(id, time) {
  let [result] = await connectionPool.query(
    `SELECT old_api_key FROM  old_api_key_list WHERE user_id = ? AND time > ?`,
    [id, time]
  );
  return result;
}
export function generateTimeSevenDaysAgo() {
  let now = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleString(
    "en-US",
    {
      timeZone: "Asia/Taipei",
    }
  );
  let time = moment(now, "M/D/YYYY hh:mm:ss a").format("YYYY-MM-DD HH:mm:ss");
  return time;
}

export function generateTimeNow() {
  let now = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Taipei",
  });
  let time = moment(now, "M/D/YYYY hh:mm:ss a").format("YYYY-MM-DD HH:mm:ss");
  return time;
}

export async function getAllActiveApiKey(id, timeNow) {
  let [result] = await connectionPool.query(
    `SELECT api_key FROM  api_key_list WHERE user_id = ?  AND expired_time > ?`,
    [id, timeNow]
  );
  return result;
}

export async function selectVerifiedUserDomainName(userId, domainName) {
  let [result] = await connectionPool.query(
    `select user_id from user_name_from_list WHERE user_id = ?  AND  domain_name = ? AND verify_status = 'success' `,
    [userId, domainName]
  );
  return result;
}

export async function createEmailAttachmentRequest(
  send_email_list_id,
  original_name,
  transform_name,
  data_type,
  upload_status,
  data_length,
  created_dt,
  upload_dt,
  statusCode,
  statusMessage
) {
  let [result] = await connectionPool.query(
    `Insert into send_email_attachment_list (send_email_list_id,original_name,transform_name,data_type,upload_status,data_length,created_dt,upload_dt,upload_status_code,upload_status_message) VALUES  (?,?,?,?,?,?,?,?,?,?)`,
    [
      send_email_list_id,
      original_name,
      transform_name,
      data_type,
      upload_status,
      data_length,
      created_dt,
      upload_dt,
      statusCode,
      statusMessage,
    ]
  );
  return result;
}

export async function getPresignedUrlFromS3(transformNameWithPath) {
  const putCommand = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: transformNameWithPath,
  });
  const url = await getSignedUrl(s3, putCommand, { expiresIn: 60 * 60 });

  return url;
}

export async function updateEmailAttachmentRequest(status, id) {
  let [result] = await connectionPool.query(
    `UPDATE send_email_attachment_list SET upload_status = ? WHERE id =? `,
    [status, id]
  );
  return result;
}

export async function updateEmailAttachmentRequestAfterResponseFromRawEmailUploadToS3(
  status,
  statusCode,
  message,
  uploadDT,
  id
) {
  let [result] = await connectionPool.query(
    `UPDATE send_email_attachment_list SET upload_status = ?,upload_status_code=?,upload_status_message=?,upload_dt=? WHERE id =? `,
    [status, statusCode, message, uploadDT, id]
  );
  return result;
}

export async function selectAttachmentSendEmailId(id) {
  let [result] = await connectionPool.query(
    `select send_email_list_id from send_email_attachment_list WHERE id = ? `,
    [id]
  );
  return result;
}

export function generateRandomString(length) {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export function checkHTMLIsIncludeTrackingLinkOrNot(link, html) {
  let checkCount = 0;
  const $ = cheerio.load(html);
  $("a").each(function () {
    const href = $(this).attr("href");
    if (href) {
      if (href == link) {
        checkCount++;
      }
    }
  });
  return checkCount;
}
