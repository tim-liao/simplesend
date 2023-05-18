import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
process.env.TZ = "Asia/Taipei";
const port = process.env.PORT;
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json" assert { type: "json" };
import Error from "./server/error/index_error.js";

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

import { trackMailClick } from "./server/route/track_mail_route.js";
app.use(trackMailClick);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
import user_route from "./server/route/user_route.js";
import send_email_route from "./server/route/send_email_route.js";
import api_key_route from "./server/route/api_key_route.js";
import email_history_route from "./server/route/email_history_route.js";
import sns_route from "./server/route/sns_route.js";
app.use("/api/1.0/", [
  send_email_route,
  api_key_route,
  email_history_route,
  user_route,
  sns_route,
]);

app.use((req, res, next) => {
  next(new Error.NotFoundError("404 not found"));
});

app.use(function (err, req, res, next) {
  const now = Date.now();
  const dateString = new Date(now).toLocaleString();
  let path = req._parsedUrl.pathname;
  console.error(path, dateString, err);
  if (err.status == 404) {
    res.redirect("/404.html");
  } else if (!err.status) {
    res.status(500).json({ error: "Server error" });
  } else {
    res.status(err.status).json({ status: err.status, message: err.message });
  }
});

app.listen(port, () => {
  console.log(`App is listening on port:${port}`);
});
