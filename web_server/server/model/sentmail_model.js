import amqp from "amqplib/callback_api.js";
import jwt from "jsonwebtoken";
import connectionPool from "./mysql_config.js";
import dotenv from "dotenv";
dotenv.config();
export async function putINMQ(messageInput) {
  amqp.connect("amqp://localhost?heartbeat=5", function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      var queue = "sendemail";
      var msg = messageInput;

      channel.assertQueue(queue, {
        durable: false,
      });

      channel.sendToQueue(queue, Buffer.from(msg));
      // console.log(" [x] Sent %s", msg);
    });
  });
}
export async function vertifyAPIKEY(key) {
  const SECRET = process.env.APP_KEY_SECRET;
  const check = jwt.verify(key, SECRET);
  return check;
}

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
