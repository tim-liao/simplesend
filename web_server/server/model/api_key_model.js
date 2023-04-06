import jwt from "jsonwebtoken";
import connectionPool from "./mysql_config.js";
import moment from "moment";
import dotenv from "dotenv";
dotenv.config();
// 設定密鑰

// 建立 Token

export async function genrateAPIKEY(id) {
  const SECRET = process.env.APP_KEY_SECRET;
  const token = jwt.sign(
    {
      userId: id,
    },
    SECRET,
    {
      expiresIn: "365d",
    }
  );
  return token;
}
export async function vertifyAPIKEY(key) {
  const SECRET = process.env.APP_KEY_SECRET;
  const check = jwt.verify(key, SECRET);
  return check;
}
export async function getIDByEmail(email) {
  let [result] = await connectionPool.query(
    `SELECT id from user where email= ? `,
    [email],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function insertApiKey(id, apikey) {
  let [result] = await connectionPool.query(
    `INSERT INTO api_key_list (user_id, API_key) VALUES (?,?)`,
    [id, apikey],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function selectApiKey(id) {
  let [result] = await connectionPool.query(
    `SELECT API_key FROM  api_key_list WHERE user_id = ?`,
    [id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function updateApiKey(id, apikey) {
  let [result] = await connectionPool.query(
    `UPDATE api_key_list SET API_key =? WHERE user_id =?  `,
    [apikey, id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function insertApiKeytoOldList(id, apikey, time) {
  let [result] = await connectionPool.query(
    `INSERT INTO old_api_key_list (user_id, old_api_key,time) VALUES (?,?,?)`,
    [id, apikey, time],
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
export function generateTimeSevenDaysAgo() {
  let now = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleString(
    "en-US",
    {
      timeZone: "Asia/Taipei",
    }
  );
  let time = moment(now, "M/D/YYYY hh:mm:ss a").format("YYYY-MM-DD HH:mm:ss");
  return time;
}

export async function selectApiKeyOldList(id, time) {
  let [result] = await connectionPool.query(
    `SELECT old_api_key FROM  old_api_key_list WHERE user_id = ? AND time > ?`,
    [id, time],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}
