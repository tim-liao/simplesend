import dotenv from "dotenv";
import {
  putINMQ,
  vertifyAPIKEY,
  generateTimeNow,
  getAllActiveApiKey,
  createEmailRequest,
  selectVerifiedUserDomainName,
  createEmailAttachmentRequest,
  getPresignedUrlFromS3,
  updateEmailAttachmentRequest,
  updateEmailAttachmentRequestAfterResponseFromrawmailUploadToS3,
  selectAttachmentSendEmailId,
  generateRandomString,
  checkHTMLIsIncludeTrackingLinkOrNot,
} from "../model/sentmail_model.js";
dotenv.config();

export async function sentmail(req, res) {
  let {
    nameFrom,
    emailTo,
    emailBcc,
    emailCc,
    emailReplyTo,
    emailSubject,
    emailBodyType,
    emailBodyContent,
    trackingLink,
    trackingOpen,
    trackingClick,
  } = req.body;
  const userId = req.body.member.id;
  if (!nameFrom) {
    const err = new Error();
    err.stack = "your request miss nameFrom";
    err.status = 400;
    throw err;
  }
  // 新增驗證nameFrom是否在資料庫中的domainname並且是成功的狀態
  let checkDomainName;
  try {
    checkDomainName = await selectVerifiedUserDomainName(userId, nameFrom);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot selectUserDomainName from sql";
    err.status = 500;
    throw err;
  }
  if (checkDomainName.length == 0) {
    const err = new Error();
    err.stack = "you can just use the verified domain name as nameFrom";
    err.status = 400;
    throw err;
  }

  if (!emailTo) {
    const err = new Error();
    err.stack = "your request miss emailTo";
    err.status = 400;
    throw err;
  }
  if (!emailSubject) {
    const err = new Error();
    err.stack = "your request miss emailSubject";
    err.status = 400;
    throw err;
  }
  if (!emailBodyType) {
    const err = new Error();
    err.stack = "your request miss emailBodyType";
    err.status = 400;
    throw err;
  }
  if (!emailBodyContent) {
    const err = new Error();
    err.stack = "your request miss emailBodyContent";
    err.status = 400;
    throw err;
  }
  if (!trackingOpen) {
    const err = new Error();
    err.stack = "your request miss trackingOpen";
    err.status = 400;
    throw err;
  }
  if (!trackingClick) {
    const err = new Error();
    err.stack = "your request miss trackingClick";
    err.status = 400;
    throw err;
  }
  if (emailBodyType != "text" && emailBodyType != "html") {
    const err = new Error();
    err.stack = "emailBodyType should type in text or html";
    err.status = 400;
    throw err;
  }
  if (emailBodyType == "text" && trackingClick == "yes") {
    const err = new Error();
    err.stack = "text type cannot be tracked click";
    err.status = 400;
    throw err;
  }
  if (trackingOpen != "yes" && trackingOpen != "no") {
    const err = new Error();
    err.stack = "trackingOpen should type in yes or no";
    err.status = 400;
    throw err;
  }
  if (trackingClick != "yes" && trackingClick != "no") {
    const err = new Error();
    err.stack = "trackingClick should type in yes or no";
    err.status = 400;
    throw err;
  }
  let trackingClickToNumber;
  if (trackingClick == "yes") {
    trackingClickToNumber = 1;
  } else if (trackingClick == "no") {
    trackingClickToNumber = 0;
  }

  let trackingOpenToNumber;
  if (trackingOpen == "yes") {
    trackingOpenToNumber = 1;
  } else if (trackingOpen == "no") {
    trackingOpenToNumber = 0;
  }
  if (trackingClick == "yes") {
    if (trackingLink == undefined) {
      const err = new Error();
      err.stack = "your want tracking click but miss trackingLink";
      err.status = 400;
      throw err;
    } else {
      let trackingLinkCount = checkHTMLIsIncludeTrackingLinkOrNot(
        trackingLink,
        emailBodyContent
      );
      // 檢查該連結是否超過一個
      // 檢查是否有該連結
      if (trackingLinkCount == 0) {
        const err = new Error();
        err.stack =
          "your do not include trackingLink you provide in html content";
        err.status = 400;
        throw err;
      } else if (trackingLinkCount > 1) {
        const err = new Error();
        err.stack = "your html content is included more than one trackingLink";
        err.status = 400;
        throw err;
      }
    }
  }
  // TODO:先把使用者的東西塞進資料庫
  // TODO:再把資料庫回傳的ID存到queue裡面
  // TODO:後續worker拿出來時會把東西從資料庫撈出來寄送
  if (emailBcc == undefined) {
    emailBcc = "undefined";
  }
  if (emailCc == undefined) {
    emailCc = "undefined";
  }

  if (emailReplyTo == undefined) {
    emailReplyTo = "undefined";
  }
  if (trackingLink == undefined) {
    trackingLink = "undefined";
  }
  let createTime = generateTimeNow();
  let sendStatus = "created";
  let firstTriggerTime = generateTimeNow();

  let originalRequestId;
  try {
    originalRequestId = await createEmailRequest(
      userId,
      nameFrom,
      emailTo,
      emailBcc,
      emailCc,
      emailReplyTo,
      emailSubject,
      emailBodyType,
      emailBodyContent,
      trackingOpenToNumber,
      trackingClickToNumber,
      createTime,
      sendStatus,
      firstTriggerTime,
      0,
      trackingLink
    );
  } catch (e) {
    console.log(e);
    const err = new Error();
    err.stack = "cannot insert createEmailRequest in sql";
    err.status = 500;
    throw err;
  }
  // console.log(originalRequestId);
  let requestId = originalRequestId.insertId;
  console.log(requestId);
  // 把requestId塞到queue裡面，之後從queue拿出來會再呼叫
  await putINMQ(requestId);

  res.status(200).send({ data: "successfully scheduled" });
}

export async function authenticationApiKey(req, res, next) {
  let { APIKEY } = req.query;
  let realUserId = req.body.user_id;
  if (!realUserId) {
    const err = new Error("No user_id");
    err.status = 401;
    err.stack = "No user_id";
    throw err;
  }
  if (!APIKEY) {
    const err = new Error("No APIKEY");
    err.status = 401;
    err.stack = "No APIKEY";
    throw err;
  }
  //  檢查apikey有沒有在全部的可用得apikey中對上
  let timeNow = generateTimeNow();
  let allActiveApiKey;
  try {
    allActiveApiKey = await getAllActiveApiKey(realUserId, timeNow);
  } catch (e) {
    console.log(e);
    const err = new Error();
    err.stack = "you are not a member of our web site ";
    err.status = 500;
    throw err;
  }
  for (let i = 0; i < allActiveApiKey.length; i++) {
    if (allActiveApiKey[i].api_key == APIKEY) {
      break;
    } else if (
      allActiveApiKey[i].api_key != APIKEY &&
      i == allActiveApiKey.length - 1
    ) {
      const err = new Error();
      err.stack = "not active api key";
      err.status = 400;
      throw err;
    }
  }
  let decoded;
  try {
    decoded = await vertifyAPIKEY(APIKEY);
  } catch (e) {
    if (e.message == "jwt expired") {
      const err = new Error("please sign in our web and genrate new API KEY");
      err.stack = "please sign in our web and genrate new API KEY";
      err.status = 403;
      throw err;
    } else {
      const err = new Error("Wrong APIKEY");
      err.stack = "Wrong APIKEY";
      err.status = 403;
      throw err;
    }
  }
  if (realUserId != decoded["userId"]) {
    const err = new Error("Wrong APIKEY");
    err.stack = "Wrong APIKEY";
    err.status = 403;
    throw err;
  }

  req.body["member"] = { id: decoded["userId"] };
  // console.log(decoded["userId"]);
  // console.log(456);//已經驗證accecc token所以不用再驗證，同時中間件已經把token包含的會員資料轉完放body了，所以可以next後可以直接用會員名字和資料
  next();
}

export async function sentrawmail(req, res) {
  // 欄位和一般的只差在attachmentData
  // 實際使用ses的寄件方式也有差別
  // 這個方法為了要可以寄送附件，須以原始email開始設計
  // 詳細原理待查

  let {
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
    trackingLink,
    attachmentDataType,
    attachmentDataLength,
    attachmentDataName,
  } = req.body;
  const userId = req.body.member.id;
  if (!nameFrom) {
    const err = new Error();
    err.stack = "your request miss nameFrom";
    err.status = 400;
    throw err;
  }
  if (!attachmentDataType) {
    const err = new Error();
    err.stack = "your request miss attachmentDataType";
    err.status = 400;
    throw err;
  }

  if (!attachmentDataLength) {
    const err = new Error();
    err.stack = "your request miss attachmentDataLength";
    err.status = 400;
    throw err;
  }
  if (attachmentDataLength >= 10485760) {
    const err = new Error();
    err.stack = "cannot upload bigger than 10MB";
    err.status = 400;
    throw err;
  }
  if (!attachmentDataName) {
    const err = new Error();
    err.stack = "your request miss attachmentDataName";
    err.status = 400;
    throw err;
  }
  // 新增驗證nameFrom是否在資料庫中的domainname並且是成功的狀態
  let checkDomainName;
  try {
    checkDomainName = await selectVerifiedUserDomainName(userId, nameFrom);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot selectUserDomainName from sql";
    err.status = 500;
    throw err;
  }
  if (checkDomainName.length == 0) {
    const err = new Error();
    err.stack = "you can just use the verified domain name as nameFrom";
    err.status = 400;
    throw err;
  }

  if (!emailTo) {
    const err = new Error();
    err.stack = "your request miss emailTo";
    err.status = 400;
    throw err;
  }
  if (!emailSubject) {
    const err = new Error();
    err.stack = "your request miss emailSubject";
    err.status = 400;
    throw err;
  }
  if (!emailBodyType) {
    const err = new Error();
    err.stack = "your request miss emailBodyType";
    err.status = 400;
    throw err;
  }
  if (!emailBodyContent) {
    const err = new Error();
    err.stack = "your request miss emailBodyContent";
    err.status = 400;
    throw err;
  }
  if (!trackingOpen) {
    const err = new Error();
    err.stack = "your request miss trackingOpen";
    err.status = 400;
    throw err;
  }
  if (!trackingClick) {
    const err = new Error();
    err.stack = "your request miss trackingClick";
    err.status = 400;
    throw err;
  }
  if (emailBodyType != "text" && emailBodyType != "html") {
    const err = new Error();
    err.stack = "emailBodyType should type in text or html";
    err.status = 400;
    throw err;
  }
  if (emailBodyType == "text" && trackingClick == "yes") {
    const err = new Error();
    err.stack = "text type cannot be tracked click";
    err.status = 400;
    throw err;
  }
  if (trackingOpen != "yes" && trackingOpen != "no") {
    const err = new Error();
    err.stack = "trackingOpen should type in yes or no";
    err.status = 400;
    throw err;
  }
  if (trackingClick != "yes" && trackingClick != "no") {
    const err = new Error();
    err.stack = "trackingClick should type in yes or no";
    err.status = 400;
    throw err;
  }
  if (trackingClick == "yes") {
    if (trackingLink == undefined) {
      const err = new Error();
      err.stack = "your want tracking click but miss trackingLink";
      err.status = 400;
      throw err;
    } else {
      let trackingLinkCount = checkHTMLIsIncludeTrackingLinkOrNot(
        trackingLink,
        emailBodyContent
      );
      // 檢查該連結是否超過一個
      // 檢查是否有該連結
      if (trackingLinkCount == 0) {
        const err = new Error();
        err.stack =
          "your do not include trackingLink you provide in html content";
        err.status = 400;
        throw err;
      } else if (trackingLinkCount > 1) {
        const err = new Error();
        err.stack = "your html content is included more than one trackingLink";
        err.status = 400;
        throw err;
      }
    }
  }
  let trackingClickToNumber;
  if (trackingClick == "yes") {
    trackingClickToNumber = 1;
  } else if (trackingClick == "no") {
    trackingClickToNumber = 0;
  }

  let trackingOpenToNumber;
  if (trackingOpen == "yes") {
    trackingOpenToNumber = 1;
  } else if (trackingOpen == "no") {
    trackingOpenToNumber = 0;
  }

  if (emailBcc == undefined) {
    emailBcc = "undefined";
  }
  if (emailCc == undefined) {
    emailCc = "undefined";
  }

  if (emailReplyTo == undefined) {
    emailReplyTo = "undefined";
  }

  let createTime = generateTimeNow();
  let sendStatus = "created";
  let firstTriggerTime = generateTimeNow();

  let originalRequestId;
  try {
    originalRequestId = await createEmailRequest(
      userId,
      nameFrom,
      emailTo,
      emailBcc,
      emailCc,
      emailReplyTo,
      emailSubject,
      emailBodyType,
      emailBodyContent,
      trackingOpenToNumber,
      trackingClickToNumber,
      createTime,
      sendStatus,
      firstTriggerTime,
      1,
      trackingLink
    );
  } catch (e) {
    console.log(e);
    const err = new Error();
    err.stack = "cannot insert createEmailRequest in sql";
    err.status = 500;
    throw err;
  }
  let emailRequestId = originalRequestId.insertId;
  // TODO:先把使用者的東西塞進資料庫
  // 除了原本之前一樣的資料，還要儲存附件的資料到資料庫（創建時間、原始檔名、檔案大小、檔案格式、上傳狀態='created'）
  //獲取副檔名，然後檔名用隨機dateNow存（不需要在意時區，我只是要不隨機而已），生成新的檔名
  let transFormNameWithPath = `${userId}/${Date.now(
    new Date()
  )}_${generateRandomString(6)}.${attachmentDataName.split(".").pop()}`;
  let originalAttachmentId;
  // console.log("transFormNameWithPath : ", transFormNameWithPath);
  try {
    originalAttachmentId = await createEmailAttachmentRequest(
      emailRequestId,
      attachmentDataName,
      transFormNameWithPath,
      attachmentDataType,
      "created",
      attachmentDataLength,
      createTime,
      createTime,
      0,
      "default"
    );
  } catch (e) {
    console.log(e);
    const err = new Error();
    err.stack = "cannot insert EmailAttachmentRequest in sql";
    err.status = 500;
    throw err;
  }
  let attachmentId = originalAttachmentId.insertId;
  // TODO:獲取新的檔名以及檔案路徑後並且向S3要求presigned url
  let url;
  try {
    url = await getPresignedUrlFromS3(transFormNameWithPath);
  } catch (e) {
    console.log(e);
    const err = new Error();
    err.stack = "cannot getPresignedUrlFromS3";
    err.status = 500;
    throw err;
  }
  // 要到之後更新狀態為pending
  try {
    await updateEmailAttachmentRequest("pending", attachmentId);
  } catch (e) {
    console.log(e);
    const err = new Error();
    err.stack = "cannot updateEmailAttachmentRequest in sql";
    err.status = 500;
    throw err;
  }
  // TODO:要求到了之後回傳url以及attachmentId給前端
  res.status(200).send({ data: { url, attachmentId } });
  // ----
  // 新增route接收使用者透過presigned url上傳檔案的的上傳狀態
  // 接收到presigned url的狀態之後，前端會對後端打這支api
  // 並且會帶著userId,sendEmailId以及presigned url  的回傳值
  // 如果statusCode是200就改成上傳成功，並且把寄件需求丟到sendrawemail的queue裡面，回覆前端已經放進排程
  // 如果不是200就紀錄失敗，回傳上傳失敗給前端
  //--------------------------------------------------------
  // // console.log(originalRequestId);

  // console.log(requestId);
  // // 把requestId塞到queue裡面，之後從queue拿出來會再呼叫
  // putINMQ(requestId);

  // res.status(200).send({ data: "successfully scheduled" });
}

export async function responseFromrawmailUploadToS3(req, res) {
  const { statusCode, statusMessage, attachmentId } = req.body;
  let uploadDT = generateTimeNow();
  if (statusCode == 200) {
    try {
      await updateEmailAttachmentRequestAfterResponseFromrawmailUploadToS3(
        "success",
        statusCode,
        statusMessage,
        uploadDT,
        attachmentId
      );
    } catch (e) {
      console.log(e);
      const err = new Error();
      err.stack =
        "cannot updateEmailAttachmentRequestAfterResponseFromrawmailUploadToS3 in sql";
      err.status = 500;
      throw err;
    }

    // TODO:紀錄成功，並透過attachmentId拿取sendemailid放到q裡面，回傳成功排程
    let originalSendEmailId;
    try {
      originalSendEmailId = await selectAttachmentSendEmailId(attachmentId);
    } catch (e) {
      console.log(e);
      const err = new Error();
      err.stack = "cannot selectAttachmentSendEmailId in sql";
      err.status = 500;
      throw err;
    }
    let sendEmailId = originalSendEmailId[0].send_email_list_id;
    putINMQ(sendEmailId);
    res.status(200).send({ data: "successfully scheduled" });
  } else {
    // 紀錄失敗，回傳上傳檔案失敗，失敗原因：...
    try {
      await updateEmailAttachmentRequestAfterResponseFromrawmailUploadToS3(
        "failed",
        statusCode,
        statusMessage,
        uploadDT,
        attachmentId
      );
    } catch (e) {
      console.log(e);
      const err = new Error();
      err.stack =
        "cannot updateEmailAttachmentRequestAfterResponseFromrawmailUploadToS3 in sql";
      err.status = 500;
      throw err;
    }
    res.status(200).send({
      data: `upload attachment failed,this is error message : ${statusMessage}`,
    });
  }
}
