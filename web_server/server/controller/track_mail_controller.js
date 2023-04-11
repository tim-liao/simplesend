import {
  addTrackingMessage,
  checkTrackingMessage,
} from "../model/track_mail_model.js";
import dotenv from "dotenv";
import { Base64 } from "js-base64";
import useragent from "useragent";
import geoip from "geoip-lite";
dotenv.config();
export async function trackMail(req, res, next) {
  let checkImagePath = req._parsedUrl.pathname;
  let referer = req.headers["referer"];
  let ip = req.headers["x-real-ip"] || req.headers["x-forwarded-for"];
  console.log(
    "user-agent:",
    req.headers["user-agent"],
    "referrer:",
    req.headers.referer,
    "ip:",
    ip
  );
  console.log("import referer is", referer);
  let geo = geoip.lookup(ip);
  console.log("import geoip is", geo);
  let agent = useragent.parse(req.headers["user-agent"]);
  console.log("import agent is", agent);
  if (checkImagePath == process.env.TRACKING_PIXEL_PATH) {
    // TODO:檢查發現進來的路徑是照片，那就可以查看是不是確實是我寄出的信件，是我寄出的信件就可以解雜湊emailId後存東西到資料庫說有被開信
    // console.log(req.headers);
    // let ip =
    //   req.ip ||
    //   req.connection.remoteAddress ||
    //   req.socket.remoteAddress ||
    //   req.connection.socket.remoteAddress;
    let ip = req.headers["x-real-ip"] || req.headers["x-forwarded-for"];
    console.log(
      "user-agent:",
      req.headers["user-agent"],
      "referrer:",
      req.headers.referer,
      "ip:",
      ip
    );
    let geo = geoip.lookup(ip);
    console.log("import geoip is", geo);
    let agent = useragent.parse(req.headers["user-agent"]);
    console.log("import agent is", agent);
    const { id } = req.query;
    if (id) {
      let decodedEmailId = Base64.decode(id);
      let checkCountInDB;
      try {
        checkCountInDB = await checkTrackingMessage(decodedEmailId);
      } catch (e) {
        const err = new Error();
        err.stack = "cannot check TrackingMessage in sql";
        err.status = 500;
        throw err;
      }
      if (checkCountInDB.length == 0) {
        // 找過資料庫沒找到，把他加進去
        try {
          await addTrackingMessage(decodedEmailId);
        } catch (e) {
          const err = new Error();
          err.stack = "cannot add TrackingMessage in sql";
          err.status = 500;
          throw err;
        }
      }
    }
  }
  next();
}
