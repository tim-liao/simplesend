import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT;
/*|| 3000*/
app.use((req, res, next) => {
  let checkImagePath = req._parsedUrl.pathname;

  if (checkImagePath == "/a.png") {
    console.log(req.query);
  }
  next();
});

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("hello world");
});

import router from "./server/route/sentmail_route.js";
app.use(express.static("public"));
app.use("/api/1.0/", [router]);

app.use((req, res, next) => {
  const err = new Error();
  err.status = 404;
  err.stack = "404 not found";
  next(err);
});

app.use(function (err, req, res, next) {
  const now = Date.now();
  const dateString = new Date(now).toLocaleString();
  console.error(dateString, err);
  res.status(err.status).json({ status: err.status, message: err.stack });
});

app.listen(port, () => {
  console.log(`App is listening on port:${port}`);
});
