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

export async function getUserSendEmailMessage(id) {
  let [result] = await connectionPool.query(
    `select s.name_from,s.email_to,s.email_bcc,s.email_cc,s.email_reply_to,s.email_subject,s.email_body_type,s.tracking_open,s.tracking_click,s.send_status,l.send_message,s.created_dt,s.tracking_link,s.attachment  from send_email_list as s JOIN send_email_log_list as l  ON s.id = l.send_email_list_id where s.user_id = ?`,
    [id],
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
