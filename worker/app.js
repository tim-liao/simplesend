import { Base64 } from "js-base64";
import { SendEmailCommand, SendRawEmailCommand } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
import client from "./model/ses_config.js";
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

import { getMessage } from "./model/rabbitmq_model.js";
import path from "path";
import fs from "fs";
import { downloadFile, deleteFile } from "./model/delete_and_download_model.js";
dotenv.config();

dotenv.config();

const aa = async function (sendEmailId) {
  // console.log(originalSendEmailInformation);
  // 把東西從資料庫拿出來
  let allSendEmailInformation;
  try {
    allSendEmailInformation = await selectAllSendEmailInformation(sendEmailId);
  } catch (e) {
    console.log(e);
  }
  // 把first_trigger_dt改成現在，並把狀態改成triggered
  try {
    let triggerTime = generateTimeNow();
    await updateSendEmailRequestStatusAndTriggerTime(
      triggerTime,
      "triggered",
      sendEmailId
    );
  } catch (e) {
    console.log(e);
  }
  //把東西寄出去
  // console.log(allSendEmailInformation);
  // const userId = allSendEmailInformation[0].user_id;
  const nameFrom = allSendEmailInformation[0].name_from;
  const emailTo = allSendEmailInformation[0].email_to;
  const emailBcc = allSendEmailInformation[0].email_bcc;
  const emailCc = allSendEmailInformation[0].email_cc;
  const emailReplyTo = allSendEmailInformation[0].email_reply_to;
  const emailSubject = allSendEmailInformation[0].email_subject;
  const emailBodyType = allSendEmailInformation[0].email_body_type;
  const emailBodyContent = allSendEmailInformation[0].email_body_content;
  const trackingOpen = allSendEmailInformation[0].tracking_open;
  const trackingClick = allSendEmailInformation[0].tracking_click;
  const trackingLink = allSendEmailInformation[0].tracking_link;
  // 0420新增：新增欄位可以寄件
  const attachment = allSendEmailInformation[0].attachment;
  //認真檢查nameFrom是不是使用者可用：web server接收時只有驗證一下下（因為不要讓負載都在web server上，同時不會讓使用者等太久），所以這邊要認真驗證，比照檢查是否可用時驗證20次，20次都通過才放行，不然的話就要存成失敗。
  // 找對應到的userId,string,domainname出來
  // let settingString;
  // let originalsSettingString;
  // try {
  //   originalsSettingString = await selectUserSettingString(userId, nameFrom);
  // } catch (e) {
  //   console.error(e);
  // }
  // settingString = originalsSettingString[0].setting_string;

  // 改成寄件時不認證
  // let txtDNSSetting = [];
  // let verifyTime = 2;
  // for (let i = 0; i < verifyTime; i++) {
  //   let originalTxtDNSSetting;
  //   try {
  //     originalTxtDNSSetting = await getTxtDNSSetting(nameFrom);
  //   } catch (e) {
  //     console.error(e);
  //   }
  //   txtDNSSetting.push(originalTxtDNSSetting[0][0]);
  // }
  // let sendEmailOrNot = 0;
  // // 用一個變數來控制究竟要不要觸發寄件function
  // if (txtDNSSetting.length == verifyTime) {
  //   // for (let i = 0; i < verifyTime; i++) {
  //   //   if (txtDNSSetting[i] != settingString) {
  //   //     // 因為我驗證多次，只要有一次不符合我的字串，就儲存failed及現在時間到我的資料庫，並回傳失敗給他
  //   //     // 如果有問題，把send_email_list的send_status改成failed
  //   //     try {
  //   //       await updateSendEmailRequestStatus("failed", sendEmailId);
  //   //     } catch (e) {
  //   //       console.error(e);
  //   //     }
  //   //     // 並且新增send_email_log_list（trigger_dt,send_response_dt都存發現錯誤的當下時間，status code以及sendmessage個別存400以及your name from is not verified）
  //   //     let timeNow = generateTimeNow();
  //   //     try {
  //   //       await insertDefaultSendEmailLog(
  //   //         sendEmailId,
  //   //         0,
  //   //         timeNow,
  //   //         timeNow,
  //   //         400,
  //   //         "your domain name is not verified"
  //   //       );
  //   //     } catch (e) {
  //   //       console.error(e);
  //   //     }
  //   //   } else if (i == verifyTime - 1 && txtDNSSetting[i] == settingString) {
  //   //     // 如果沒問題就放行
  //   //     sendEmailOrNot = 1;
  //   //   }
  //   // }
  // } else {
  //   // 長度不足代表有至少一次回圈失敗，有失敗代表還沒有真的更新完成
  //   // 如果有問題，把send_email_list的send_status改成failed
  //   try {
  //     await updateSendEmailRequestStatus("failed", sendEmailId);
  //   } catch (e) {
  //     console.error(e);
  //   }
  //   // 並且新增send_email_log_list（trigger_dt,send_response_dt都存發現錯誤的當下時間，status code以及sendmessage個別存400以及your name from is not verified）
  //   let timeNow = generateTimeNow();
  //   try {
  //     await insertDefaultSendEmailLog(
  //       sendEmailId,
  //       0,
  //       timeNow,
  //       timeNow,
  //       400,
  //       "your domain name is not verified"
  //     );
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

  /////////
  let transformName;
  // 原本的檔案路徑只存在下面這個else if block裡面，但因為刪除檔案也需要這個路徑，所以會需要把檔案路徑寫在外面
  let params;
  if (attachment == 0) {
    // trackingOpen以及trackingClick對應後有四種狀況，來決定要不要塞入
    let messageBody;
    if (trackingOpen == 1 && trackingClick == 1) {
      if (emailBodyType == "html") {
        // 遍歷全部得html尋找href，把他替換成tracking link
        let HTMLData = transformToTrackedHTML(
          emailBodyContent,
          sendEmailId,
          trackingLink
        );
        // 最後塞tracking pixel到html尾端
        let base64UTF8EncodedSendEmailId = Base64.encode(`${sendEmailId}`);
        HTMLData += `<img src="${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedSendEmailId}">`;
        // 並分類在html
        messageBody = { Html: { Charset: "UTF-8", Data: HTMLData } };
      } else if (emailBodyType == "text") {
        const err = new Error("text type cannot be tracked click");
        err.stack = "text type cannot be tracked click";
        err.status = 500;
        console.error(err);
      }
    } else if (trackingOpen == 1 && trackingClick == 0) {
      if (emailBodyType == "html") {
        // 塞tracking pixel到html尾端
        let base64UTF8EncodedSendEmailId = Base64.encode(`${sendEmailId}`);
        let HTMLData =
          emailBodyContent +
          `<img src="${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedSendEmailId}">`;
        // 並分類在html

        messageBody = { Html: { Charset: "UTF-8", Data: HTMLData } };
      } else if (emailBodyType == "text") {
        // 塞tracking pixel到文字後面
        let base64UTF8EncodedSendEmailId = Base64.encode(`${sendEmailId}`);
        let HTMLData =
          emailBodyContent +
          `<img src="${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedSendEmailId}">`;
        // 並分類在html

        messageBody = { Html: { Charset: "UTF-8", Data: HTMLData } };
      }
    } else if (trackingOpen == 0 && trackingClick == 1) {
      if (emailBodyType == "html") {
        // 遍歷全部得html尋找href，把他替換成tracking link
        let HTMLData = transformToTrackedHTML(
          emailBodyContent,
          sendEmailId,
          trackingLink
        );
        // 並分類在html
        // console.log("HTMLData", HTMLData);

        messageBody = { Html: { Charset: "UTF-8", Data: HTMLData } };
      } else if (emailBodyType == "text") {
        const err = new Error("text type cannot be tracked click");
        err.stack = "text type cannot be tracked click";
        err.status = 500;
        console.error(err);
      }
    } else if (trackingOpen == 0 && trackingClick == 0) {
      if (emailBodyType == "html") {
        // 直接輸出並分類在html

        messageBody = {
          Html: { Charset: "UTF-8", Data: emailBodyContent },
        };
      } else if (emailBodyType == "text") {
        // 直接輸出並分類在text

        messageBody = {
          Text: { Charset: "UTF-8", Data: emailBodyContent },
        };
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
    // console.log(messageBody);
  } else if (attachment == 1) {
    let originalAttachmentInfor;
    try {
      originalAttachmentInfor = await selectAttchmentInfor(sendEmailId);
    } catch (e) {
      console.log(e);
    }
    let originalName = originalAttachmentInfor[0].original_name;
    let transformNameWithPath = originalAttachmentInfor[0].transform_name;
    let dataType = originalAttachmentInfor[0].data_type;
    transformName = path.basename(transformNameWithPath);

    // 下載附件（下載到指定資料夾）
    // console.log(
    //   "url :",
    //   `${process.env.S3_ATTACHMENT_URL}${transformNameWithPath}`
    // );
    try {
      await downloadFile(
        `${process.env.S3_ATTACHMENT_URL}${transformNameWithPath}`,
        `./downloads/${transformName}`
      );
    } catch (e) {
      console.log(e);
    } finally {
      // console.log("下載完畢");
    }

    // 下載好後整理資料
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
    emailData.push(`Subject: ${emailSubject}`);
    emailData.push('Content-Type: multipart/mixed; boundary="mixed-boundary"');
    emailData.push("");
    emailData.push("--mixed-boundary");
    emailData.push(
      'Content-Type: multipart/alternative; boundary="alternative-boundary"'
    );
    emailData.push("");
    emailData.push("--alternative-boundary");

    // 寫邏輯塞tracking（text,html）
    if (trackingOpen == 1 && trackingClick == 1) {
      if (emailBodyType == "html") {
        // 遍歷全部得html尋找href，把他替換成tracking link
        let HTMLData = transformToTrackedHTML(
          emailBodyContent,
          sendEmailId,
          trackingLink
        );
        // 最後塞tracking pixel到html尾端
        let base64UTF8EncodedSendEmailId = Base64.encode(`${sendEmailId}`);
        HTMLData += `<img src="${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedSendEmailId}">`;
        // 並分類在html
        // messageBody = { Html: { Charset: "UTF-8", Data: HTMLData } };
        emailData.push('Content-Type: text/html; charset="UTF-8"');
        emailData.push("");
        emailData.push(HTMLData);
      } else if (emailBodyType == "text") {
        const err = new Error("text type cannot be tracked click");
        err.stack = "text type cannot be tracked click";
        err.status = 500;
        console.error(err);
      }
    } else if (trackingOpen == 1 && trackingClick == 0) {
      if (emailBodyType == "html") {
        // 塞tracking pixel到html尾端
        let base64UTF8EncodedSendEmailId = Base64.encode(`${sendEmailId}`);
        let HTMLData =
          emailBodyContent +
          `<img src="${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedSendEmailId}">`;
        // 並分類在html

        // messageBody = { Html: { Charset: "UTF-8", Data: HTMLData } };
        emailData.push('Content-Type: text/html; charset="UTF-8"');
        emailData.push("");
        emailData.push(HTMLData);
      } else if (emailBodyType == "text") {
        // 塞tracking pixel到文字後面
        let base64UTF8EncodedSendEmailId = Base64.encode(`${sendEmailId}`);
        let HTMLData =
          emailBodyContent +
          `<img src="${process.env.ADRESS}${process.env.TRACKING_PIXEL_PATH}?id=${base64UTF8EncodedSendEmailId}">`;
        // 並分類在html

        // messageBody = { Html: { Charset: "UTF-8", Data: HTMLData } };
        emailData.push('Content-Type: text/html; charset="UTF-8"');
        emailData.push("");
        emailData.push(HTMLData);
      }
    } else if (trackingOpen == 0 && trackingClick == 1) {
      if (emailBodyType == "html") {
        // 遍歷全部得html尋找href，把他替換成tracking link
        let HTMLData = transformToTrackedHTML(
          emailBodyContent,
          sendEmailId,
          trackingLink
        );
        // 並分類在html
        // console.log("HTMLData", HTMLData);

        // messageBody = { Html: { Charset: "UTF-8", Data: HTMLData } };
        emailData.push('Content-Type: text/html; charset="UTF-8"');
        emailData.push("");
        emailData.push(HTMLData);
      } else if (emailBodyType == "text") {
        const err = new Error("text type cannot be tracked click");
        err.stack = "text type cannot be tracked click";
        err.status = 500;
        console.error(err);
      }
    } else if (trackingOpen == 0 && trackingClick == 0) {
      if (emailBodyType == "html") {
        // 直接輸出並分類在html

        // messageBody = {
        //   Html: { Charset: "UTF-8", Data: emailBodyContent },
        // };
        emailData.push('Content-Type: text/html; charset="UTF-8"');
        emailData.push("");
        emailData.push(emailBodyContent);
      } else if (emailBodyType == "text") {
        // 直接輸出並分類在text

        // messageBody = {
        //   Text: { Charset: "UTF-8", Data: emailBodyContent },
        // };
        emailData.push('Content-Type: text/plain; charset="UTF-8"');
        emailData.push("");
        emailData.push(emailBodyContent);
      }
    }
    emailData.push(`--mixed-boundary
Content-Disposition: attachment; filename="${originalName}"
Content-Type: ${dataType}
Content-Transfer-Encoding: base64
`);
    const attachmentData = fs.readFileSync(`./downloads/${transformName}`); // 讀取附件檔案
    const attachmentContent = attachmentData.toString("base64");
    emailData.push(attachmentContent);
    emailData.push("");
    emailData.push("--mixed-boundary--");
    let realEmailData = emailData.join("\n");
    // console.log(realEmailData);
    params = {
      RawMessage: {
        Data: Buffer.from(`${realEmailData}`),
      },
      Source: `${nameFrom}${process.env.FROM_EMAIL}`,
    };
  }

  // 如果東西整理好準備要寄送時就把資料庫得狀態改成pending

  // console.log(params);
  try {
    await updateSendEmailRequestStatus("pending", sendEmailId);
  } catch (e) {
    console.error(e);
  }

  let command;
  if (attachment == 1) {
    command = new SendRawEmailCommand(params);
  } else if (attachment == 0) {
    command = new SendEmailCommand(params);
  }
  let data;
  let count = 1;
  // 04/16變更：原本資料庫裡面count＝０是指第一次寄件就成功，但為了因應認證donmain name，可能在真正寄件前就擋下來，所以把count=0讓給真正沒有寄件的狀況
  let failedSendStatusCode;
  let failedSendMessage;
  let messageId;
  async function sendEmailToSES() {
    // 這個function是寄送郵件
    let sendEmailLogId;
    let triggerTimeNow = generateTimeNow();
    let responseDT;
    try {
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
    } catch (e) {
      console.error(e);
    }

    try {
      data = await client.send(command);
    } catch (e) {
      failedSendStatusCode = e["$metadata"].httpStatusCode;
      failedSendMessage = e.message;
      messageId = 0;
      // console.error(e["$metadata"].httpStatusCode, e.message);
    } finally {
      responseDT = generateTimeNow();
    }

    count++;
    // 寄件成功就資料庫得狀態改成success，並紀錄回傳email log以及回傳時間紀錄到資料庫
    if (data && data["$metadata"].httpStatusCode == 200) {
      messageId = data.MessageId;
      try {
        await updateSendEmailLog(
          sendEmailLogId,
          responseDT,
          200,
          "successfully send email",
          messageId
        );
      } catch (e) {
        console.error(e);
      }
      try {
        await updateSendEmailRequestStatus("success", sendEmailId);
      } catch (e) {
        console.error(e);
      }

      if (attachment == 1) {
        // 刪除該物件
        // console.log("成功");
        try {
          await deleteFile(`./downloads/${transformName}`);
        } catch (e) {
          console.log(e);
        } finally {
          // console.log("刪除完畢");
        }
      }
    } else if (!data && count < 6) {
      // 寄件失敗但在補寄過程時，不需要變更資料庫寄件狀態，但要紀錄email log，並紀錄回傳時間到資料庫
      setTimeout(sendEmailToSES, count * 2000);
      try {
        await updateSendEmailLog(
          sendEmailLogId,
          responseDT,
          failedSendStatusCode,
          failedSendMessage,
          messageId
        );
      } catch (e) {
        console.error(e);
      }
    } else if (!data && count == 6) {
      // 若是自動補寄完仍然失敗，變更資料庫寄件狀態為failed，並紀錄email log，並紀錄回傳時間到資料庫
      try {
        await updateSendEmailLog(
          sendEmailLogId,
          responseDT,
          failedSendStatusCode,
          failedSendMessage,
          messageId
        );
      } catch (e) {
        console.error(e);
      }
      try {
        await updateSendEmailRequestStatus("failed", sendEmailId);
      } catch (e) {
        console.error(e);
      }

      if (attachment == 1) {
        // 刪除該物件
        // console.log("失敗");
        try {
          await deleteFile(`./downloads/${transformName}`);
        } catch (e) {
          console.log(e);
        } finally {
          // console.log("刪除完畢");
        }
      }
    }
  }

  // 在第一次調用時，第一次0秒後執行
  setTimeout(sendEmailToSES, 0);
};

getMessage(aa);
