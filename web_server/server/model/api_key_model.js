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

export async function insertApiKey(id, apikey, status, startTime, expiredTime) {
  let [result] = await connectionPool.query(
    `INSERT INTO api_key_list (user_id,api_key,status,start_time,expired_time) VALUES (?,?,?,?,?)`,
    [id, apikey, status, startTime, expiredTime],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export function generateTime365DaysLater() {
  let now = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleString(
    "en-US",
    {
      timeZone: "Asia/Taipei",
    }
  );
  let time = moment(now, "M/D/YYYY hh:mm:ss a").format("YYYY-MM-DD HH:mm:ss");
  return time;
}

export async function selectApiKey(id, status, timeNow) {
  let [result] = await connectionPool.query(
    `SELECT api_key FROM  api_key_list WHERE user_id = ? AND status = ? AND expired_time > ?`,
    [id, status, timeNow],
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
export function generateTimeSevenDaysLater() {
  let now = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleString(
    "en-US",
    {
      timeZone: "Asia/Taipei",
    }
  );
  let time = moment(now, "M/D/YYYY hh:mm:ss a").format("YYYY-MM-DD HH:mm:ss");
  return time;
}

export async function updateApiKeyexpiredTimeAndStatus(
  id,
  apikey,
  expiredTime,
  status
) {
  let [result] = await connectionPool.query(
    `UPDATE api_key_list SET expired_time = ? , status = ?  WHERE API_key = ? AND user_id = ?  `,
    [expiredTime, status, apikey, id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function getAllActiveApiKey(id, timeNow) {
  let [result] = await connectionPool.query(
    `SELECT api_key,expired_time FROM  api_key_list WHERE user_id = ?  AND expired_time > ?`,
    [id, timeNow],
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
