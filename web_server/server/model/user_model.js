import { connectionPool } from "./mysql_config.js";

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
