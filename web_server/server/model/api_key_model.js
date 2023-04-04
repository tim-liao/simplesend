import jwt from "jsonwebtoken";
import connectionPool from "./mysql_config.js";
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
