import connectionPool from "./mysql_config.js";

export async function addTrackingMessage(
  sendEmailListId,
  trackingType,
  recipientCountry,
  recipientBrowser,
  recipientPlatform,
  publicIp,
  refererUrl,
  triggerDt
) {
  let [result] = await connectionPool.query(
    `INSERT INTO tracking_email_list (send_email_list_id,tracking_type,recipient_country,recipient_browser,recipient_platform,public_ip,referer_url,trigger_dt) VALUES (?,?,?,?,?,?,?,?)`,
    [
      sendEmailListId,
      trackingType,
      recipientCountry,
      recipientBrowser,
      recipientPlatform,
      publicIp,
      refererUrl,
      triggerDt,
    ],
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
export function generateTimeNow() {
  let now = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Taipei",
  });
  let time = moment(now, "M/D/YYYY hh:mm:ss a").format("YYYY-MM-DD HH:mm:ss");
  return time;
}
export async function vertifyLink(link) {
  const SECRET = process.env.TRACK_LINK_SECRET;
  const check = jwt.verify(link, SECRET);
  return check;
}
