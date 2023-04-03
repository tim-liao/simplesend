import amqp from "amqplib/callback_api.js";
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
