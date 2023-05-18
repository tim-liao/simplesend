import dotenv from "dotenv";
import {
  putInMQ,
  verifyApiKey,
  generateTimeNow,
  getAllActiveApiKey,
  createEmailRequest,
  selectVerifiedUserDomainName,
  createEmailAttachmentRequest,
  getPresignedUrlFromS3,
  updateEmailAttachmentRequest,
  updateEmailAttachmentRequestAfterResponseFromRawEmailUploadToS3,
  selectAttachmentSendEmailId,
  generateRandomString,
  checkHTMLIsIncludeTrackingLinkOrNot,
} from "../model/send_email_model.js";
dotenv.config();
import Error from "../error/index_error.js";
export async function sentEmail(req, res) {
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
    err.message = "your request miss nameFrom";
    err.status = 400;
    throw err;
  }
  // 新增驗證nameFrom是否在資料庫中的domain name並且是成功的狀態
  let checkDomainName = await selectVerifiedUserDomainName(userId, nameFrom);

  if (checkDomainName.length === 0) {
    throw new Error.BadRequestError(
      "you can just use the verified domain name as nameFrom"
    );
  }

  if (!emailTo) {
    throw new Error.BadRequestError("your request miss emailTo");
  }
  if (!emailSubject) {
    throw new Error.BadRequestError("your request miss emailSubject");
  }
  if (!emailBodyType) {
    throw new Error.BadRequestError("your request miss emailBodyType");
  }

  if (!emailBodyContent) {
    throw new Error.BadRequestError("your request miss emailBodyContent");
  }
  if (!trackingOpen) {
    throw new Error.BadRequestError("your request miss trackingOpen");
  }
  if (!trackingClick) {
    throw new Error.BadRequestError("your request miss trackingClick");
  }
  if (emailBodyType !== "text" && emailBodyType !== "html") {
    throw new Error.BadRequestError(
      "emailBodyType should type in text or html"
    );
  }
  if (emailBodyType === "text" && trackingClick === "yes") {
    throw new Error.BadRequestError("text type cannot be tracked click");
  }
  if (trackingOpen !== "yes" && trackingOpen !== "no") {
    throw new Error.BadRequestError("trackingOpen should type in yes or no");
  }
  if (trackingClick !== "yes" && trackingClick !== "no") {
    throw new Error.BadRequestError("trackingClick should type in yes or no");
  }
  let trackingClickToNumber;
  if (trackingClick === "yes") {
    trackingClickToNumber = 1;
  } else if (trackingClick === "no") {
    trackingClickToNumber = 0;
  }

  let trackingOpenToNumber;
  if (trackingOpen === "yes") {
    trackingOpenToNumber = 1;
  } else if (trackingOpen === "no") {
    trackingOpenToNumber = 0;
  }
  if (trackingClick === "yes") {
    if (trackingLink === undefined) {
      throw new Error.BadRequestError(
        "your want tracking click but miss trackingLink"
      );
    } else {
      let trackingLinkCount = checkHTMLIsIncludeTrackingLinkOrNot(
        trackingLink,
        emailBodyContent
      );
      // 檢查該連結是否超過一個
      // 檢查是否有該連結
      if (trackingLinkCount === 0) {
        throw new Error.BadRequestError(
          "your do not include trackingLink you provide in html content"
        );
      } else if (trackingLinkCount > 1) {
        throw new Error.BadRequestError(
          "your html content is included more than one trackingLink"
        );
      }
    }
  }
  // 先把使用者的東西塞進資料庫
  // 再把資料庫回傳的ID存到queue裡面
  // 後續worker拿出來時會把東西從資料庫撈出來寄送
  if (emailBcc === undefined) {
    emailBcc = "undefined";
  }
  if (emailCc === undefined) {
    emailCc = "undefined";
  }

  if (emailReplyTo === undefined) {
    emailReplyTo = "undefined";
  }
  if (trackingLink === undefined) {
    trackingLink = "undefined";
  }
  let createTime = generateTimeNow();
  let sendStatus = "created";
  let firstTriggerTime = generateTimeNow();

  let originalRequestId = await createEmailRequest(
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

  let requestId = originalRequestId.insertId;

  await putInMQ(requestId);

  res.status(200).send({ data: "successfully scheduled" });
}

export async function authenticationApiKey(req, res, next) {
  let { APIKEY } = req.query;
  let realUserId = req.body.user_id;
  if (!realUserId) {
    throw new Error.UnauthorizedError("No user_id");
  }
  if (!APIKEY) {
    throw new Error.UnauthorizedError("No api key");
  }
  //  檢查 api key 有沒有在全部的可用得 api key 中對上
  let timeNow = generateTimeNow();
  let allActiveApiKey;

  allActiveApiKey = await getAllActiveApiKey(realUserId, timeNow);

  for (let i = 0; i < allActiveApiKey.length; i++) {
    if (allActiveApiKey[i].api_key === APIKEY) {
      break;
    } else if (
      allActiveApiKey[i].api_key !== APIKEY &&
      i === allActiveApiKey.length - 1
    ) {
      throw new Error.BadRequestError("not active api key");
    }
  }
  let decoded;
  try {
    decoded = await verifyApiKey(APIKEY);
  } catch (e) {
    if (e.message === "jwt expired") {
      throw new Error.ForbiddenError(
        "please sign in our web and generate new API KEY"
      );
    } else {
      throw new Error.ForbiddenError("Wrong api key");
    }
  }
  if (realUserId !== decoded["userId"]) {
    throw new Error.ForbiddenError("Wrong api key");
  }

  req.body["member"] = { id: decoded["userId"] };
  // console.log(decoded["userId"]);
  // console.log(456);//已經驗證access token所以不用再驗證，同時中間件已經把token包含的會員資料轉完放body了，所以可以next後可以直接用會員名字和資料
  next();
}

export async function sentRawEmail(req, res) {
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
    throw new Error.BadRequestError("your request miss nameFrom");
  }
  if (!attachmentDataType) {
    throw new Error.BadRequestError("your request miss attachmentDataType");
  }

  if (!attachmentDataLength) {
    throw new Error.BadRequestError("your request miss attachmentDataLength");
  }
  if (attachmentDataLength >= 10485760) {
    throw new Error.BadRequestError("cannot upload bigger than 10MB");
  }

  if (!attachmentDataName) {
    throw new Error.BadRequestError("your request miss attachmentDataName");
  }
  // 新增驗證nameFrom是否在資料庫中的domainName並且是成功的狀態
  let checkDomainName = await selectVerifiedUserDomainName(userId, nameFrom);

  if (checkDomainName.length === 0) {
    throw new Error.BadRequestError(
      "you can just use the verified domain name as nameFrom"
    );
  }

  if (!emailTo) {
    throw new Error.BadRequestError("your request miss emailTo");
  }
  if (!emailSubject) {
    throw new Error.BadRequestError("your request miss emailSubject");
  }
  if (!emailBodyType) {
    throw new Error.BadRequestError("your request miss emailBodyType");
  }
  if (!emailBodyContent) {
    throw new Error.BadRequestError("your request miss emailBodyContent");
  }
  if (!trackingOpen) {
    throw new Error.BadRequestError("your request miss trackingOpen");
  }
  if (!trackingClick) {
    throw new Error.BadRequestError("your request miss trackingClick");
  }
  if (emailBodyType !== "text" && emailBodyType !== "html") {
    throw new Error.BadRequestError(
      "emailBodyType should type in text or html"
    );
  }
  if (emailBodyType === "text" && trackingClick === "yes") {
    throw new Error.BadRequestError("text type cannot be tracked click");
  }
  if (trackingOpen !== "yes" && trackingOpen !== "no") {
    throw new Error.BadRequestError("trackingOpen should type in yes or no");
  }
  if (trackingClick !== "yes" && trackingClick !== "no") {
    throw new Error.BadRequestError("trackingClick should type in yes or no");
  }
  if (trackingClick === "yes") {
    if (trackingLink === undefined) {
      throw new Error.BadRequestError(
        "your want tracking click but miss trackingLink"
      );
    } else {
      let trackingLinkCount = checkHTMLIsIncludeTrackingLinkOrNot(
        trackingLink,
        emailBodyContent
      );
      // 檢查該連結是否超過一個
      // 檢查是否有該連結
      if (trackingLinkCount === 0) {
        throw new Error.BadRequestError(
          "your do not include trackingLink you provide in html content"
        );
      } else if (trackingLinkCount > 1) {
        throw new Error.BadRequestError(
          "your html content is included more than one trackingLink"
        );
      }
    }
  }
  let trackingClickToNumber;
  if (trackingClick === "yes") {
    trackingClickToNumber = 1;
  } else if (trackingClick === "no") {
    trackingClickToNumber = 0;
  }

  let trackingOpenToNumber;
  if (trackingOpen === "yes") {
    trackingOpenToNumber = 1;
  } else if (trackingOpen === "no") {
    trackingOpenToNumber = 0;
  }

  if (emailBcc === undefined) {
    emailBcc = "undefined";
  }
  if (emailCc === undefined) {
    emailCc = "undefined";
  }

  if (emailReplyTo === undefined) {
    emailReplyTo = "undefined";
  }

  let createTime = generateTimeNow();
  let sendStatus = "created";
  let firstTriggerTime = generateTimeNow();

  let originalRequestId = await createEmailRequest(
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

  let emailRequestId = originalRequestId.insertId;
  // 先把使用者的東西塞進資料庫
  // 除了原本之前一樣的資料，還要儲存附件的資料到資料庫（創建時間、原始檔名、檔案大小、檔案格式、上傳狀態='created'）
  //獲取副檔名，然後檔名用隨機dateNow存（不需要在意時區，我只是要不隨機而已），生成新的檔名
  let transFormNameWithPath = `${userId}/${Date.now(
    new Date()
  )}_${generateRandomString(6)}.${attachmentDataName.split(".").pop()}`;
  let originalAttachmentId;
  // console.log("transFormNameWithPath : ", transFormNameWithPath);

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

  let attachmentId = originalAttachmentId.insertId;
  // 獲取新的檔名以及檔案路徑後並且向S3要求presigned url
  let url = await getPresignedUrlFromS3(transFormNameWithPath);

  // 要到之後更新狀態為pending

  await updateEmailAttachmentRequest("pending", attachmentId);

  //要求到了之後回傳url以及attachmentId給前端
  res.status(200).send({ data: { url, attachmentId } });
}

export async function responseFromRawEmailUploadToS3(req, res) {
  const { statusCode, statusMessage, attachmentId } = req.body;
  let uploadDT = generateTimeNow();
  if (statusCode === 200) {
    await updateEmailAttachmentRequestAfterResponseFromRawEmailUploadToS3(
      "success",
      statusCode,
      statusMessage,
      uploadDT,
      attachmentId
    );

    // 紀錄成功，並透過attachmentId拿取send email id放到q裡面，回傳成功排程
    let originalSendEmailId;

    originalSendEmailId = await selectAttachmentSendEmailId(attachmentId);

    let sendEmailId = originalSendEmailId[0].send_email_list_id;
    await putInMQ(sendEmailId);
    res.status(200).send({ data: "successfully scheduled" });
  } else {
    // 紀錄失敗，回傳上傳檔案失敗，失敗原因：...

    await updateEmailAttachmentRequestAfterResponseFromRawEmailUploadToS3(
      "failed",
      statusCode,
      statusMessage,
      uploadDT,
      attachmentId
    );

    res.status(200).send({
      data: `upload attachment failed,this is error message : ${statusMessage}`,
    });
  }
}
