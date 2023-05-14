import moment from "moment";
import connectionPool from "../../util/mysql_config.js";
export function generateTimeNow() {
  let now = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Taipei",
  });
  let time = moment(now, "M/D/YYYY hh:mm:ss a").format("YYYY-MM-DD HH:mm:ss");
  return time;
}

export async function createDeliveryStatusFromMailServer(
  messageId,
  type,
  emailAddress,
  action,
  actionMessage,
  createTime
) {
  let [result] = await connectionPool.query(
    `Insert into  delivery_status_from_mail_server_list (send_email_log_send_response_message_id,notification_type,email_address,action,action_message,created_dt) VALUES  (?,?,?,?,?,?)`,
    [messageId, type, emailAddress, action, actionMessage, createTime]
  );
  return result;
}
