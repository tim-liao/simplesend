import connectionPool from "./sql_config.js";
export async function insertEmailInforDefaultStatusIsFailed(
  user_id,
  email_subject,
  time
) {
  let [result] = await connectionPool.query(
    `INSERT INTO send_email_list (user_id, email_subject,time,status) VALUES (?,?,?,?)`,
    [user_id, email_subject, time, 0],
    function (err) {
      if (err) throw err;
    }
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
    [send_email_list_id, error_status, error_log, recipientEmail],
    function (err) {
      if (err) throw err;
    }
  );
  return result.insertId;
}

export async function updateFailedEmailStatusBeSuccess(id) {
  let [result] = await connectionPool.query(
    `UPDATE send_email_list SET status = 1 WHERE id =?  `,
    [id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}
