import connectionPool from "../util/sql_config.js";
export async function insertEmailInforDefaultStatusIsFailed(
  user_id,
  email_subject,
  time
) {
  let [result] = await connectionPool.query(
    `INSERT INTO send_email_list (user_id, email_subject,time,status) VALUES (?,?,?,?)`,
    [user_id, email_subject, time, 0]
  );
  //   return會回傳id
  return result.insertId;
}

export async function insertFailedEmailInfor(
  send_email_list_id,
  recipientEmail,
  error_status,
  error_log
) {
  let [result] = await connectionPool.query(
    `INSERT INTO failed_email_list (send_email_list_id, error_status,error_log,recipient_email) VALUES (?,?,?,?)`,
    [send_email_list_id, error_status, error_log, recipientEmail]
  );
  return result.insertId;
}

export async function updateFailedEmailStatusBeSuccess(id) {
  let [result] = await connectionPool.query(
    `UPDATE send_email_list SET status = 1 WHERE id =?  `,
    [id]
  );
  return result;
}
// //////////////////

export async function selectAllSendEmailInformation(id) {
  let [result] = await connectionPool.query(
    `SELECT user_id,name_from,email_to,email_bcc,email_cc,email_reply_to,email_subject,email_body_type,email_body_content,tracking_open,tracking_click,attachment,tracking_link FROM  send_email_list WHERE id = ?`,
    [id]
  );
  return result;
}

export async function updateSendEmailRequestStatusAndTriggerTime(
  firstTriggerDt,
  status,
  id
) {
  let [result] = await connectionPool.query(
    `UPDATE send_email_list SET first_trigger_dt = ? , send_status = ?  WHERE id =  ?  `,
    [firstTriggerDt, status, id]
  );
  return result;
}

export async function updateSendEmailRequestStatus(status, sendEmailId) {
  let [result] = await connectionPool.query(
    `UPDATE send_email_list SET send_status = ?  WHERE id =  ?  `,
    [status, sendEmailId]
  );
  return result;
}

export async function insertDefaultSendEmailLog(
  sendEmailListId,
  sendCount,
  triggerDT,
  sendResponseDT,
  SendStatusCode,
  SendMessage,
  messageId
) {
  let [result] = await connectionPool.query(
    `INSERT INTO send_email_log_list (send_email_list_id,send_count,trigger_dt,send_response_dt,send_status_code,send_message,send_response_message_id) VALUES (?,?,?,?,?,?,?)`,
    [
      sendEmailListId,
      sendCount,
      triggerDT,
      sendResponseDT,
      SendStatusCode,
      SendMessage,
      messageId,
    ]
  );
  return result.insertId;
}

export async function updateSendEmailLog(
  id,
  sendResponseDT,
  SendStatusCode,
  SendMessage,
  messageId
) {
  let [result] = await connectionPool.query(
    `UPDATE  send_email_log_list SET send_response_dt = ? ,send_status_code = ? , send_message = ?, send_response_message_id = ?  WHERE id =  ?  `,
    [sendResponseDT, SendStatusCode, SendMessage, messageId, id]
  );
  return result.insertId;
}

export async function selectUserSettingString(id, domainName) {
  let [result] = await connectionPool.query(
    `select setting_string from user_name_from_list WHERE user_id = ? AND domain_name = ? `,
    [id, domainName]
  );
  return result;
}

export async function selectAttchmentInfor(sendEmailId) {
  let [result] = await connectionPool.query(
    `select original_name,transform_name,data_type from send_email_attachment_list WHERE send_email_list_id =?`,
    [sendEmailId]
  );
  return result;
}
