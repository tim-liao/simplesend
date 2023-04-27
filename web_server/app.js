import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
process.env.TZ = "Asia/Taipei";
const port = process.env.PORT;
/*|| 3000*/
// import { createServer } from "http";
// import { Server } from "socket.io";
// const httpServer = createServer();
// const io = new Server(httpServer, {
//   cors: {
//     origin: "http://localhost:3030",
//   },
// });
// httpServer.listen(3030);
import { trackMailClick } from "./server/route/track_mail_route.js";
app.use(trackMailClick);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.redirect("/introduction.html");
});
import user_route from "./server/route/user_route.js";
import sentmail_route from "./server/route/sentmail_route.js";
import api_key_route from "./server/route/api_key_route.js";
import email_history_route from "./server/route/email_history_route.js";
import sns_route from "./server/route/sns_route.js";
app.use("/api/1.0/", [
  sentmail_route,
  api_key_route,
  email_history_route,
  user_route,
  sns_route,
]);

app.use((req, res, next) => {
  const err = new Error();
  err.status = 404;
  err.stack = "404 not found";
  next(err);
});

app.use(function (err, req, res, next) {
  const now = Date.now();
  const dateString = new Date(now).toLocaleString();
  let path = req._parsedUrl.pathname;
  console.error(path, dateString, err);
  // res.redirect("/404.html");
  if (err.status == 404) {
    res.redirect("/404.html");
  } else {
    res.status(err.status).json({ status: err.status, message: err.stack });
  }
});

app.listen(port, () => {
  console.log(`App is listening on port:${port}`);
});
