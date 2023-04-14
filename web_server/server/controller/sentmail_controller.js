import dotenv from "dotenv";
import {
  putINMQ,
  vertifyAPIKEY,
  selectApiKey,
  selectApiKeyOldList,
  generateTimeSevenDaysAgo,
  generateTimeNow,
  getAllActiveApiKey,
  createEmailRequest,
} from "../model/sentmail_model.js";
dotenv.config();

export async function sentmail(req, res, next) {
  const {
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
  } = req.body;
  const userId = req.body.member.id;
  if (!nameFrom) {
    const err = new Error();
    err.stack = "your request miss nameFrom";
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

  // TODO:先把使用者的東西塞進資料庫
  // TODO:再把資料庫回傳的ID存到queue裡面
  // TODO:後續worker拿出來時會把東西從資料庫撈出來寄送
  if (!emailBcc) {
    emailBcc = "undfined";
  }
  if (!emailCc) {
    emailCc = "undfined";
  }
  if (!emailReplyTo) {
    emailReplyTo = "undfined";
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
      firstTriggerTime
    );
  } catch (e) {
    console.log(e);
    const err = new Error();
    err.stack = "cannot insert createEmailRequest in sql";
    err.status = 500;
    throw err;
  }
  // console.log(originalRequestId);
  let requestId = `${originalRequestId.insertId}`;
  console.log(requestId);
  // 把requestId塞到queue裡面，之後從queue拿出來會再呼叫
  putINMQ(requestId);

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

// export async function genrateapikey(req, res) {
//   const userId = req.body.member.id;
//   let newAPIKEY;
//   try {
//     newAPIKEY = await genrateAPIKEY(userId);
//   } catch (e) {
//     const err = new Error();
//     err.stack = "cannot genrate API KEY";
//     err.status = 500;
//     throw err;
//   }
//   try {
//     await updateApiKey(userId, newAPIKEY);
//   } catch (e) {
//     console.log(e);
//     const err = new Error();
//     err.stack = "cannot udpate API KEY with user";
//     err.status = 500;
//     throw err;
//   }
//   res.status(200).send({ data: newAPIKEY });
// }
