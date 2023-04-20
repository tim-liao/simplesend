import amqp from "amqplib";
export async function getMessage(cb) {
  const conn = await amqp.connect("amqp://localhost?heartbeat=5");
  const ch = await conn.createConfirmChannel(conn);
  ch.assertQueue("sendemail", { durable: false });
  ch.consume(
    "sendemail",
    function (msg) {
      // let output
      //   console.log(" [x] Received %s", msg.content.toString());
      let sendEmailId = msg.content.toString();
      cb(sendEmailId);
    },
    {
      noAck: true,
    }
  );
}
