import connectionPool from "./mysql_config.js";
export async function getEmailHistory(id, startTime, endTime) {
  let [result] = await connectionPool.query(
    `select time from send_email_list where user_id = ? and time > ? and time < ?`,
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
    `select status from send_email_list where user_id = ? `,
    [id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function getUserSuccessSentEmailCount(id) {
  let [result] = await connectionPool.query(
    `SELECT COUNT(*) FROM send_email_list WHERE user_id = ? AND status = 1`,
    [id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function getOpenedEmailCount(id) {
  let [result] = await connectionPool.query(
    `SELECT COUNT(*) FROM tracking_email_list JOIN send_email_list ON send_email_list_id = send_email_list.id WHERE send_email_list.user_id=?`,
    [id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}
