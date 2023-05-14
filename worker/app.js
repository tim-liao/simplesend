import { Base64 } from "js-base64";
import { SendEmailCommand, SendRawEmailCommand } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
import client from "./util/ses_config.js";
import {
  selectAllSendEmailInformation,
  updateSendEmailRequestStatusAndTriggerTime,
  updateSendEmailRequestStatus,
  insertDefaultSendEmailLog,
  updateSendEmailLog,
  selectAttchmentInfor,
} from "./model/sql_model.js";
import { generateTimeNow } from "./model/time_model.js";
import { transformToTrackedHTML } from "./model/transform_html_model.js";
import { errorMessageDisplay } from "./error/error_message_display.js";
import Error from "./error/indexError.js";
import { getMessage } from "./model/rabbitmq_model.js";
import path from "path";
import fs from "fs";
import { downloadFile, deleteFile } from "./model/delete_and_download_model.js";
dotenv.config();

const getSendEmailInfoFromQueueAndExecute = async function (sendEmailId) {
  // 把東西從資料庫拿出來
  try {
    let allSendEmailInformation = await selectAllSendEmailInformation(
      sendEmailId
    );
    // 把first_trigger_dt改成現在，並把狀態改成triggered

    let triggerTime = generateTimeNow();
    await updateSendEmailRequestStatusAndTriggerTime(
      triggerTime,
      "triggered",
      sendEmailId
    );

    //把東西寄出去
    // console.log(allSendEmailInformation);
    const sendEmailInfoFromDB = allSendEmailInformation[0];
    const userId = sendEmailInfoFromDB.user_id;
    const nameFrom = sendEmailInfoFromDB.name_from;
    const emailTo = sendEmailInfoFromDB.email_to;
    const emailBcc = sendEmailInfoFromDB.email_bcc;
    const emailCc = sendEmailInfoFromDB.email_cc;
    const emailReplyTo = sendEmailInfoFromDB.email_reply_to;
    const emailSubject = sendEmailInfoFromDB.email_subject;
    const emailBodyType = sendEmailInfoFromDB.email_body_type;
    const emailBodyContent = sendEmailInfoFromDB.email_body_content;
    const trackingOpen = sendEmailInfoFromDB.tracking_open;
    const trackingClick = sendEmailInfoFromDB.tracking_click;
    const trackingLink = sendEmailInfoFromDB.tracking_link;
    const attachment = sendEmailInfoFromDB.attachment;

    let transformName;
    // 原本的檔案路徑只存在下面這個else if block裡面，但因為刪除檔案也需要這個路徑，所以會需要把檔案路徑寫在外面
    let params;
    if (attachment === 0) {
      // trackingOpen以及trackingClick對應後有四種狀況，來決定要不要塞入
      let messageBody;
      if (trackingOpen === 1) {
        let base64UTF8EncodedSendEmailId = Base64.encode(`${sendEmailId}`);
        let trackingPixel = `<img src="${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedSendEmailId}">`;
        if (trackingClick === 1) {
          if (emailBodyType === "html") {
            let HTMLData = transformToTrackedHTML(
              emailBodyContent,
              sendEmailId,
              trackingLink
            );
            HTMLData += trackingPixel;
            messageBody = { Html: { Charset: "UTF-8", Data: HTMLData } };
          } else {
            throw new Error.BadRequestError(
              "text type cannot be tracked click"
            );
          }
        } else {
          let HTMLData = emailBodyContent + trackingPixel;
          messageBody = { Html: { Charset: "UTF-8", Data: HTMLData } };
        }
      } else {
        if (trackingClick === 1) {
          if (emailBodyType === "html") {
            // 遍歷全部得html尋找href，把他替換成tracking link
            let HTMLData = transformToTrackedHTML(
              emailBodyContent,
              sendEmailId,
              trackingLink
            );
            messageBody = { Html: { Charset: "UTF-8", Data: HTMLData } };
          } else {
            throw new Error.BadRequestError(
              "text type cannot be tracked click"
            );
          }
        } else {
          if (emailBodyType === "html") {
            // 直接輸出並分類在html
            messageBody = {
              Html: { Charset: "UTF-8", Data: emailBodyContent },
            };
          } else {
            // 直接輸出並分類在text
            messageBody = {
              Text: { Charset: "UTF-8", Data: emailBodyContent },
            };
          }
        }
      }
      // 把資料準備好做成params
      // 檢查emailBcc,emailCc,emailReplyTo是不是undfined，是得話就把這幾個欄位改成空值array
      let eamilBccArray = [];
      let emailCcArray = [];
      let emailReplyToArray = [];

      if (emailBcc != "undefined") {
        eamilBccArray.push(emailBcc);
      }
      if (emailCc != "undefined") {
        emailCcArray.push(emailCc);
      }
      if (emailReplyTo != "undefined") {
        emailReplyToArray.push(emailReplyTo);
      }
      params = {
        Destination: {
          CcAddresses: emailCcArray,
          ToAddresses: [emailTo],
          BccAddresses: eamilBccArray,
        },
        Message: {
          Body: messageBody,
          Subject: {
            Charset: "UTF-8",
            Data: emailSubject,
          },
        },
        Source: `${nameFrom}${process.env.FROM_EMAIL}`,
        ReplyToAddresses: emailReplyToArray,
      };
    } else if (attachment === 1) {
      let originalAttachmentInfor = await selectAttchmentInfor(sendEmailId);
      let originalName = originalAttachmentInfor[0].original_name;
      let transformNameWithPath = originalAttachmentInfor[0].transform_name;
      let dataType = originalAttachmentInfor[0].data_type;
      transformName = path.basename(transformNameWithPath);
      await downloadFile(
        `${process.env.S3_ATTACHMENT_URL}${transformNameWithPath}`,
        `./downloads/${transformName}`
      );
      let emailData = [];
      emailData.push(`TO: ${emailTo}`);
      if (emailBcc != "undefined") {
        emailData.push(`Bcc: ${emailBcc}`);
      }
      if (emailCc != "undefined") {
        emailData.push(`Cc: ${emailCc}`);
      }
      if (emailReplyTo != "undefined") {
        emailData.push(`Reply-To: ${emailReplyTo}`);
      }
      emailData.push(
        ...[
          `Subject: ${emailSubject}`,
          'Content-Type: multipart/mixed; boundary="mixed-boundary"',
          "",
          "--mixed-boundary",
          'Content-Type: multipart/alternative; boundary="alternative-boundary"',
          "",
          "--alternative-boundary",
        ]
      );

      if (trackingOpen === 1) {
        let base64UTF8EncodedSendEmailId = Base64.encode(`${sendEmailId}`);
        let trackingPixel = `<img src="${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedSendEmailId}">`;
        if (trackingClick === 1) {
          if (emailBodyType == "html") {
            let HTMLData = transformToTrackedHTML(
              emailBodyContent,
              sendEmailId,
              trackingLink
            );
            HTMLData += trackingPixel;
            emailData.push(
              ...['Content-Type: text/html; charset="UTF-8"', "", HTMLData]
            );
          } else {
            throw new Error.BadRequestError(
              "text type cannot be tracked click"
            );
          }
        } else {
          let HTMLData = emailBodyContent + trackingPixel;
          emailData.push(
            ...['Content-Type: text/html; charset="UTF-8"', "", HTMLData]
          );
        }
      } else {
        if (trackingClick === 1) {
          if (emailBodyType === "html") {
            // 遍歷全部得html尋找href，把他替換成tracking link
            let HTMLData = transformToTrackedHTML(
              emailBodyContent,
              sendEmailId,
              trackingLink
            );
            // 並分類在html
            emailData.push(
              ...['Content-Type: text/html; charset="UTF-8"', "", HTMLData]
            );
          } else {
            throw new Error.BadRequestError(
              "text type cannot be tracked click"
            );
          }
        } else {
          if (emailBodyType === "html") {
            // 直接輸出並分類在html
            emailData.push(
              ...[
                'Content-Type: text/html; charset="UTF-8"',
                "",
                emailBodyContent,
              ]
            );
          } else {
            emailData.push(
              ...[
                'Content-Type: text/plain; charset="UTF-8"',
                "",
                emailBodyContent,
              ]
            );
          }
        }
      }
      emailData.push(`--mixed-boundary
Content-Disposition: attachment; filename="${originalName}"
Content-Type: ${dataType}
Content-Transfer-Encoding: base64
`);
      const attachmentData = fs.readFileSync(`./downloads/${transformName}`); // 讀取附件檔案
      const attachmentContent = attachmentData.toString("base64");
      emailData.push(...[attachmentContent, "", "--mixed-boundary--"]);
      let realEmailData = emailData.join("\n");
      params = {
        RawMessage: {
          Data: Buffer.from(`${realEmailData}`),
        },
        Source: `${nameFrom}${process.env.FROM_EMAIL}`,
      };
    }
    // 如果東西整理好準備要寄送時就把資料庫得狀態改成pending
    await updateSendEmailRequestStatus("pending", sendEmailId);
    let command;
    if (attachment === 1) {
      command = new SendRawEmailCommand(params);
    } else if (attachment === 0) {
      command = new SendEmailCommand(params);
    }
    let data;
    let count = 1;
    let endCount = 6;
    let failedSendStatusCode;
    let failedSendMessage;
    let messageId;
    async function sendEmailToSES() {
      // 這個function是寄送郵件
      let sendEmailLogId;
      let triggerTimeNow = generateTimeNow();
      let responseDT;
      // 新增email log資料並說明trigger_dt以及同一個sendemailid的寄件次數
      sendEmailLogId = await insertDefaultSendEmailLog(
        sendEmailId,
        count,
        triggerTimeNow,
        triggerTimeNow,
        0,
        "default",
        "default"
      );
      try {
        data = await client.send(command);
      } catch (e) {
        failedSendStatusCode = e["$metadata"].httpStatusCode;
        failedSendMessage = e.message;
        messageId = 0;
      } finally {
        responseDT = generateTimeNow();
      }
      count++;
      // 寄件成功就資料庫得狀態改成success，並紀錄回傳email log以及回傳時間紀錄到資料庫
      if (data && data["$metadata"].httpStatusCode === 200) {
        messageId = data.MessageId;
        await updateSendEmailLog(
          sendEmailLogId,
          responseDT,
          200,
          "successfully send email",
          messageId
        );
        await updateSendEmailRequestStatus("success", sendEmailId);
        if (attachment === 1) {
          // 刪除該物件
          await deleteFile(`./downloads/${transformName}`);
        }
      } else if (!data && count < endCount) {
        // 寄件失敗但在補寄過程時，不需要變更資料庫寄件狀態，但要紀錄email log，並紀錄回傳時間到資料庫
        setTimeout(sendEmailToSES, count * 2000);
        await updateSendEmailLog(
          sendEmailLogId,
          responseDT,
          failedSendStatusCode,
          failedSendMessage,
          messageId
        );
      } else if (!data && count === endCount) {
        // 若是自動補寄完仍然失敗，變更資料庫寄件狀態為failed，並紀錄email log，並紀錄回傳時間到資料庫
        await updateSendEmailLog(
          sendEmailLogId,
          responseDT,
          failedSendStatusCode,
          failedSendMessage,
          messageId
        );
        await updateSendEmailRequestStatus("failed", sendEmailId);
        if (attachment === 1) {
          // 刪除該附件
          await deleteFile(`./downloads/${transformName}`);
        }
      }
    }
    // 第一次調用，0秒後執行
    setTimeout(sendEmailToSES, 0);
  } catch (e) {
    errorMessageDisplay(sendEmailId, e);
  }
};

getMessage(getSendEmailInfoFromQueueAndExecute);
