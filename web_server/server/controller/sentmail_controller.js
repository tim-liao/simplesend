import dotenv from "dotenv";
import {
  putINMQ,
  vertifyAPIKEY,
  selectApiKey,
  selectApiKeyOldList,
  generateTimeSevenDaysAgo,
} from "../model/sentmail_model.js";
dotenv.config();

export async function sentmail(req, res, next) {
  const { email, yourname, text, html, yourSubject } = req.body;
  const userId = req.body.member.id;
  if (!(text || html)) {
    const err = new Error();
    err.stack = "your request miss content";
    err.status = 400;
    throw err;
  }
  if (text && html) {
    const err = new Error();
    err.stack = "your request cannot contain both text and html";
    err.status = 400;
    throw err;
  }
  if (!email || !yourname || !yourSubject) {
    const err = new Error();
    err.stack = "your request miss something";
    err.status = 400;
    throw err;
  }
  //TODO:把使用者的寄件資料塞到queue裡面(還沒做會員認證)
  let sendemailInfor = { email, yourname, yourSubject, userId };

  if (text) {
    sendemailInfor["text"] = text;
  } else if (html) {
    sendemailInfor["html"] = html;
  }
  sendemailInfor = JSON.stringify(sendemailInfor);
  putINMQ(sendemailInfor);

  res.status(200).send({ data: "successfully scheduled" });
}

export async function authenticationApiKey(req, res, next) {
  let { APIKEY } = req.query;
  let realUserId = req.body.user_id;
  if (!realUserId) {
    const err = new Error("No user_id");
    err.status = 401;
    err.stack = "No user_id";
    throw err;
  }
  if (!APIKEY) {
    const err = new Error("No APIKEY");
    err.status = 401;
    err.stack = "No APIKEY";
    throw err;
  }
  let apiKeyInDB;
  try {
    let aa = await selectApiKey(realUserId);
    apiKeyInDB = await aa[0].API_key;
  } catch (e) {
    console.log(e);
    const err = new Error();
    err.stack = "you are not a member of our web site ";
    err.status = 500;
    throw err;
  }
  let apiKeyInOldDB;
  let timeSevenDaysAgo = generateTimeSevenDaysAgo();
  try {
    let aa = await selectApiKeyOldList(realUserId, timeSevenDaysAgo);
    // console.log(aa);
    if (aa[0]) {
      apiKeyInOldDB = await aa[0].old_api_key;
    }
  } catch (e) {
    console.log(e);
    const err = new Error("cannot get old apikey from sql");
    err.stack = "cannot get old apikey from sql";
    err.status = 500;
    throw err;
  }
  // console.log(apiKeyInOldDB);
  if ((apiKeyInOldDB || apiKeyInDB) == APIKEY) {
    const err = new Error(
      "please sign in our page and check your newest api key"
    );
    err.stack = "please sign in our page and check your newest api key";
    err.status = 400;
    throw err;
  }

  let decoded;
  try {
    decoded = await vertifyAPIKEY(APIKEY);
  } catch (e) {
    if (e.message == "jwt expired") {
      const err = new Error("please sign in our web and genrate new API KEY");
      err.stack = "please sign in our web and genrate new API KEY";
      err.status = 403;
      throw err;
    } else {
      const err = new Error("Wrong APIKEY");
      err.stack = "Wrong APIKEY";
      err.status = 403;
      throw err;
    }
  }
  if (realUserId != decoded["userId"]) {
    const err = new Error("Wrong APIKEY");
    err.stack = "Wrong APIKEY";
    err.status = 403;
    throw err;
  }

  req.body["member"] = { id: decoded["userId"] };
  // console.log(decoded["userId"]);
  // console.log(456);//已經驗證accecc token所以不用再驗證，同時中間件已經把token包含的會員資料轉完放body了，所以可以next後可以直接用會員名字和資料
  next();
}

// export async function genrateapikey(req, res) {
//   const userId = req.body.member.id;
//   let newAPIKEY;
//   try {
//     newAPIKEY = await genrateAPIKEY(userId);
//   } catch (e) {
//     const err = new Error();
//     err.stack = "cannot genrate API KEY";
//     err.status = 500;
//     throw err;
//   }
//   try {
//     await updateApiKey(userId, newAPIKEY);
//   } catch (e) {
//     console.log(e);
//     const err = new Error();
//     err.stack = "cannot udpate API KEY with user";
//     err.status = 500;
//     throw err;
//   }
//   res.status(200).send({ data: newAPIKEY });
// }
