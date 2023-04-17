import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
export function wrapAsync(fn) {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
}
export async function authentication(req, res, next) {
  let originalToken = req.headers["authorization"];
  let checkBearer = "";
  const SECRET = process.env.ACCESS_TOKEN_SECRET;
  // console.log(req.headers);
  if (!originalToken) {
    const err = new Error();
    err.status = 401;
    err.stack = "No token";
    throw err;
  }
  for (let i = 0; i < 7; i++) {
    checkBearer = checkBearer + originalToken[i];
  }

  if (checkBearer != "Bearer ") {
    const err = new Error();
    err.status = 403;
    err.stack = "Not Bearer Token";
    throw err;
  } else if (checkBearer == "Bearer ") {
    const realToken = req.header("Authorization").replace("Bearer ", "");
    // console.log(realToken);
    let decoded;
    try {
      decoded = jwt.verify(realToken, SECRET);
    } catch (e) {
      // console.log(e);
      const err = new Error();
      err.stack = "Wrong token";
      err.status = 403;
      throw err;
    }
    // console.log(decoded);
    req.body["member"] = {
      userId: decoded["userid"],
      email: decoded["useremail"],
    };
    //已經驗證accecc token所以不用再驗證，同時中間件已經把token包含的會員資料轉完放body了，所以可以next後可以直接用會員id和email
    next();
  } else {
    const err = new Error();
    err.stack = "no token";
    err.status = 401;
    throw err;
  }
}
