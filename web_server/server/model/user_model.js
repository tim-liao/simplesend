import connectionPool from "./mysql_config.js";

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
    `select user.id,user.name,user.email,api_key_list.API_key from user JOIN api_key_list on user.id = api_key_list.user_id AND user.id = ? `,
    [id],
    function (err) {
      if (err) throw err;
    }
  );
  return result;
}
