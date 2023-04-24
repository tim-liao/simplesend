import {
  generateTimeNow,
  createdeliveryStatusFromMailServer,
} from "../model/sns_model.js";

export async function sns(req, res, next) {
  //   const data = req.body;

  let responsefromSNS = JSON.parse(req.body);

  let responseMessage = JSON.parse(responsefromSNS.Message);
  let responsefromSNSType = responsefromSNS.Type;
  if (responsefromSNSType != "Notification") {
    console.log(responsefromSNS);
    const err = new Error();
    err.stack = "something wrong with sns notification";
    err.status = 500;
    throw err;
  }
  // 檢查這個messageId在send_email_log_list裡面有沒有
  // 有的話就確認這個是delivery還是bounce
  // 若是bounce就找寄件失敗的bounceMessage，然後把裡面的emailAddress記錄下來
  // 若是delivery的話就把裡面的emailAddress記錄下來
  let responseMessageType = responseMessage["notificationType"];
  let responseMessageId = responseMessage.mail.messageId;

  if (responseMessageType == "Bounce") {
    let bouncedRecipientsInfor = responseMessage.bounce.bouncedRecipients;
    let createTime = generateTimeNow();
    for (let i = 0; i < bouncedRecipientsInfor.length; i++) {
      let bouncedEmailAddress = bouncedRecipientsInfor[i].emailAddress;
      let actionMessage = bouncedRecipientsInfor[i].diagnosticCode;
      let action = bouncedRecipientsInfor[i].action;
      try {
        await createdeliveryStatusFromMailServer(
          responseMessageId,
          responseMessageType,
          bouncedEmailAddress,
          action,
          actionMessage,
          createTime
        );
      } catch (e) {
        const err = new Error();
        err.stack = "cannot createdeliveryStatusFromMailServer in sql";
        err.status = 500;
        throw err;
      }
    }
  } else if (responseMessageType == "Delivery") {
    let createTime = generateTimeNow();
    let recipientsArray = responseMessage.delivery.recipients;
    for (let i = 0; i < recipientsArray.length; i++) {
      try {
        await createdeliveryStatusFromMailServer(
          responseMessageId,
          responseMessageType,
          recipientsArray[i],
          "success",
          "success",
          createTime
        );
      } catch (e) {
        const err = new Error();
        err.stack = "cannot createdeliveryStatusFromMailServer in sql";
        err.status = 500;
        throw err;
      }
    }
  } else {
    console.log(responsefromSNS);
    const err = new Error();
    err.stack = "something wrong with sns notification";
    err.status = 500;
    throw err;
  }
  return res.json({});
}
