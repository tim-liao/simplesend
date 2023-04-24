import connectionPool from "./mysql_config.js";
import crypto from "crypto";
import moment from "moment";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import dns from "dns";
dotenv.config();
export async function addUser(name, email, hashword) {
  let [result] = await connectionPool.query(
    `INSERT INTO user (name, email, hashword) VALUES (?,?,?)`,
    [name, email, hashword],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}
export async function checkUserEmail(email) {
  let [result] = await connectionPool.query(
    `SELECT id from user where email= ? `,
    [email],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function selectPasswordByEmail(email) {
  let [result] = await connectionPool.query(
    `SELECT hashword from user where email= ? `,
    [email],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function selectUserProfile(id) {
  let [result] = await connectionPool.query(
    `select id,name,email from user WHERE id = ? `,
    [id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function selectUserSettingString(id, domainName) {
  let [result] = await connectionPool.query(
    `select setting_string from user_name_from_list WHERE user_id = ? AND domain_name = ? `,
    [id, domainName],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function selectDomainName(domainName) {
  let [result] = await connectionPool.query(
    `select user_id from user_name_from_list WHERE domain_name = ? `,
    [domainName],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export function genrateVerifyString() {
  return crypto.randomBytes(16).toString("hex");
}

export async function addUserDomainNameWithString(
  userId,
  domainName,
  verifyStatus,
  settingString,
  createdDt,
  verifyDt
) {
  let [result] = await connectionPool.query(
    `INSERT INTO user_name_from_list (user_id,domain_name,verify_status,setting_string,created_dt,verify_dt) VALUES (?,?,?,?,?,?)`,
    [userId, domainName, verifyStatus, settingString, createdDt, verifyDt],
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

export async function getTxtDNSSetting(domainName) {
  const domain = domainName;
  const txtRecord = "txt." + domain;
  const dnsPromises = dns.promises;
  let output = await dnsPromises.resolveTxt(txtRecord);
  return output;
}

export async function updateUserDomainNameStatus(
  varifyStatus,
  verifyDt,
  userId,
  settingString,
  domainName
) {
  let [result] = await connectionPool.query(
    `UPDATE user_name_from_list SET verify_status = ?,verify_dt = ? WHERE user_id = ? AND setting_string = ? AND domain_name =? `,
    [varifyStatus, verifyDt, userId, settingString, domainName],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function selectAllUserDomainNameINfor(id) {
  let [result] = await connectionPool.query(
    `select domain_name,setting_string , verify_status from user_name_from_list WHERE user_id = ?  AND verify_status !='deleted' `,
    [id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function updateUserDNSStatus(verifyStatus, userId, domainName) {
  let [result] = await connectionPool.query(
    `UPDATE user_name_from_list SET verify_status =? WHERE user_id =?  AND domain_name =? `,
    [verifyStatus, userId, domainName],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function checkUserEmailUsedOrNot(email) {
  let [result] = await connectionPool.query(
    `select  id from user where email = ? `,
    [email],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function createPasswordHashed(passWord, saltRounds) {
  let result = await bcrypt.hash(passWord, saltRounds);
  return result;
}

export async function createNewUserInfor(name, email, password) {
  let [result] = await connectionPool.query(
    `INSERT INTO user (name,email,password) VALUES (?,?,?) `,
    [name, email, password],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function genrateUserAccessToken(userid, useremail, expiredTime) {
  const SECRET = process.env.ACCESS_TOKEN_SECRET;
  const token = jwt.sign(
    {
      userid: userid,
      useremail: useremail,
    },
    SECRET,
    {
      expiresIn: expiredTime,
    }
  );
  return token;
}

export async function getPasswordAndUserIdWithNameByEmail(email) {
  let [result] = await connectionPool.query(
    `select  password,id,name from user where email = ? `,
    [email],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}

export async function checkPassword(passWord, hashedPassword) {
  let result = await bcrypt.compare(passWord, hashedPassword);
  return result;
}

export async function getUserNameById(userId) {
  let [result] = await connectionPool.query(
    `select  name from user where id = ? `,
    [userId],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}
