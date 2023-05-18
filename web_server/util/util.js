import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Error from "../server/error/index_error.js";
dotenv.config();
// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
export function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}
export async function authentication(req, res, next) {
  let originalToken = req.headers["authorization"];
  let checkBearer = "";
  const SECRET = process.env.ACCESS_TOKEN_SECRET;
  // console.log(req.headers);
  if (!originalToken) {
    throw new Error.UnauthorizedError("No token");
  }
  for (let i = 0; i < 7; i++) {
    checkBearer = checkBearer + originalToken[i];
  }

  if (checkBearer != "Bearer ") {
    throw new Error.ForbiddenError("Not Bearer Token");
  } else if (checkBearer == "Bearer ") {
    const realToken = req.header("Authorization").replace("Bearer ", "");
    // console.log(realToken);
    let decoded;
    try {
      decoded = jwt.verify(realToken, SECRET);
    } catch (e) {
      throw new Error.ForbiddenError("Wrong token");
    }
    // console.log(decoded);
    req.body["member"] = {
      userId: decoded["userId"],
      email: decoded["userEmail"],
    };
    //已經驗證access token所以不用再驗證，同時中間件已經把token包含的會員資料轉完放body了，所以可以next後可以直接用會員id和email
    next();
  } else {
    throw new Error.UnauthorizedError("No token");
  }
}
