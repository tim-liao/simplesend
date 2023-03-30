import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT; /*|| 3000*/

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use((req, res, next) => {
  const err = new Error("請洽系統管理員~~~~");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.error = err;
  res.status(err.status);
  res.render("error");
  // res.json(err);
});

app.listen(port, () => {
  console.log(`App is listening on port:${port}`);
});
