import {
  generateTimeNow,
  createDeliveryStatusFromMailServer,
} from "../model/sns_model.js";

export async function sns(req, res) {
  let responseFromSNS = JSON.parse(req.body);

  let responseMessage = JSON.parse(responseFromSNS.Message);
  let responsefromSNSType = responseFromSNS.Type;
  if (responsefromSNSType !== "Notification") {
    console.error("something wrong with sns notification", responseFromSNS);
  }
  // 檢查這個messageId在send_email_log_list裡面有沒有
  // 有的話就確認這個是delivery還是bounce
  // 若是bounce就找寄件失敗的bounceMessage，然後把裡面的emailAddress記錄下來
  // 若是delivery的話就把裡面的emailAddress記錄下來
  let responseMessageType = responseMessage["notificationType"];
  let responseMessageId = responseMessage.mail.messageId;

  if (responseMessageType === "Bounce") {
    let bouncedRecipientsInfo = responseMessage.bounce.bouncedRecipients;
    let createTime = generateTimeNow();
    for (let i = 0; i < bouncedRecipientsInfo.length; i++) {
      let bouncedEmailAddress = bouncedRecipientsInfo[i].emailAddress;
      let actionMessage = bouncedRecipientsInfo[i].diagnosticCode;
      let action = bouncedRecipientsInfo[i].action;

      await createDeliveryStatusFromMailServer(
        responseMessageId,
        responseMessageType,
        bouncedEmailAddress,
        action,
        actionMessage,
        createTime
      );
    }
  } else if (responseMessageType === "Delivery") {
    let createTime = generateTimeNow();
    let recipientsArray = responseMessage.delivery.recipients;
    for (let i = 0; i < recipientsArray.length; i++) {
      await createDeliveryStatusFromMailServer(
        responseMessageId,
        responseMessageType,
        recipientsArray[i],
        "success",
        "success",
        createTime
      );
    }
  } else {
    console.error("something wrong with sns notification", responseFromSNS);
  }
  return res.json({});
}
