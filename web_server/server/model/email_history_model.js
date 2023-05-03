import connectionPool from "./mysql_config.js";
export async function getEmailHistory(id, startTime, endTime) {
  let [result] = await connectionPool.query(
    `select created_dt from send_email_list where user_id = ? and created_dt > ? and created_dt < ?`,
    [id, startTime, endTime],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export function turnTimeZone(time) {
  //   console.log(123, time);

  const date = new Date(`${time}`);
  const tzOffset = +480;
  const taiwanDate = new Date(date.getTime() + tzOffset * 60 * 1000);
  //   console.log(date);
  let output = taiwanDate.toISOString().replace("T", " ").replace("Z", "");

  return output;
}

export async function getUserEmailStatus(id) {
  let [result] = await connectionPool.query(
    `select send_status from send_email_list where user_id = ? `,
    [id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function getUserSuccessSentEmailCount(id) {
  let [result] = await connectionPool.query(
    `SELECT COUNT(*) FROM send_email_list WHERE user_id = ? AND send_status = "success" `,
    [id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function getOpenedEmailCount(id) {
  let [result] = await connectionPool.query(
    `SELECT COUNT(*) FROM tracking_email_list JOIN send_email_list ON send_email_list_id = send_email_list.id WHERE send_email_list.user_id=? AND tracking_type = 'pixel'`,
    [id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function getUserSentEmailCount(id) {
  let [result] = await connectionPool.query(
    `SELECT COUNT(*) FROM send_email_list WHERE user_id = ?`,
    [id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function getUserSendEmailMessagewithoutAttchment(
  id,
  startTime,
  endTime
) {
  let [result] = await connectionPool.query(
    `select s.name_from,s.email_to,s.email_bcc,s.email_cc,s.email_reply_to,s.email_subject,s.email_body_type,s.tracking_open,s.tracking_click,s.send_status,l.send_message,s.created_dt,s.tracking_link,s.attachment  from send_email_list as s JOIN send_email_log_list as l  ON s.id = l.send_email_list_id where s.user_id = ? AND s.attachment = 0 and s.created_dt > ? and s.created_dt < ? ORDER BY s.created_dt ASC
    LIMIT 1001 OFFSET 0`,
    [id, startTime, endTime],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}
export async function getUserSendEmailwithAttchment(id, startTime, endTime) {
  let [result] = await connectionPool.query(
    `select s.name_from,s.email_to,s.email_bcc,s.email_cc,s.email_reply_to,s.email_subject,s.email_body_type,s.tracking_open,s.tracking_click,s.send_status,l.send_message,s.created_dt,s.tracking_link,a.original_name  from send_email_list as s JOIN send_email_log_list as l  ON s.id = l.send_email_list_id JOIN send_email_attachment_list as a ON a.send_email_list_id = s.id where s.user_id = ? and s.created_dt > ? and s.created_dt < ? ORDER BY s.created_dt ASC  LIMIT 1001 OFFSET 0 `,
    [id, startTime, endTime],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function getUserTrackingClickInformation(id) {
  let [result] = await connectionPool.query(
    `select t.recipient_country,t.recipient_browser,t.recipient_platform from send_email_list as s join tracking_email_list as t on s.id = t.send_email_list_id where s.user_id =? and t.tracking_type = 'link'`,
    [id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function getUserEmailSendActionFromSNS(userId) {
  let [result] = await connectionPool.query(
    `select action from delivery_status_from_mail_server_list as d join send_email_log_list as l on d.send_email_log_send_response_message_id =l.send_response_message_id join send_email_list as e on e.id = l.send_email_list_id where e.user_id = ?`,
    [userId],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function getUserSendEmailBounceMessage(id) {
  let [result] = await connectionPool.query(
    `select d.email_address,d.action,d.action_message,d.created_dt from  delivery_status_from_mail_server_list as d JOIN send_email_log_list as s ON d.send_email_log_send_response_message_id = s.send_response_message_id JOIN send_email_list as e  ON e.id = s.send_email_list_id where e.user_id = ? AND d.notification_type='Bounce'`,
    [id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}
