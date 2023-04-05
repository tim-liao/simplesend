import connectionPool from "./mysql_config.js";

export async function addTrackingMessage(id) {
  let [result] = await connectionPool.query(
    `INSERT INTO tracking_email_list (send_email_list_id, opened_count) VALUES (?,?)`,
    [id, 1],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function checkTrackingMessage(id) {
  let [result] = await connectionPool.query(
    `SELECT id from tracking_email_list where send_email_list_id = ? `,
    [id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}
