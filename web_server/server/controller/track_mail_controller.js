import {
  generateTimeNow,
  addTrackingMessage,
  vertifyLink,
} from "../model/track_mail_model.js";
import dotenv from "dotenv";
import { Base64 } from "js-base64";
import useragent from "useragent";
import geoip from "geoip-lite";

dotenv.config();
export async function trackMail(req, res, next) {
  let checkImagePath = req._parsedUrl.pathname;
  if (checkImagePath == process.env.TRACKING_PIXEL_PATH) {
    // TODO:檢查發現進來的路徑是照片，那就可以查看是不是確實是我寄出的信件，是我寄出的信件就可以解雜湊emailId後存東西到資料庫說有被開信
    let ip = req.headers["x-real-ip"] || req.headers["x-forwarded-for"];
    let geo = geoip.lookup(ip);
    let agent = useragent.parse(req.headers["user-agent"]);
    const { id } = req.query;
    if (id) {
      let decodedSendEmailId = Base64.decode(id);
      // TODO:這邊id是sendEmailId
      // 把東西解析後存到資料庫
      const recipientBrowser = agent.family;
      const trackingType = "pixel";
      const recipientCountry = geo.country;
      const allSource = agent.source;
      let recipientPlatform;
      let startIndex = allSource.indexOf("(") + 1;
      let endIndex = allSource.indexOf(";", startIndex);
      let result = allSource.substring(startIndex, endIndex);
      if (result) {
        recipientPlatform = result;
      } else {
        recipientPlatform = allSource;
      }
      let publicIp = ip;
      let refererUrl = req.headers.referer;
      let triggerDt = generateTimeNow();
      try {
        await addTrackingMessage(
          decodedSendEmailId,
          trackingType,
          recipientCountry,
          recipientBrowser,
          recipientPlatform,
          publicIp,
          refererUrl,
          triggerDt
        );
      } catch (e) {
        console.log(e);
        const err = new Error();
        err.stack = "cannot addTrackingMessage in sql";
        err.status = 500;
        throw err;
      }
    }
    next();
  } else if (checkImagePath == process.env.TRACKING_LINK_PATH) {
    // TODO:是tracking_link，所以要解析並存到資料庫
    let ip = req.headers["x-real-ip"] || req.headers["x-forwarded-for"];
    let geo = geoip.lookup(ip);
    let agent = useragent.parse(req.headers["user-agent"]);
    const { link } = req.query;
    if (link) {
      let originalLinkWithSendEmailId = vertifyLink(link);
      let sendEmailId = originalLinkWithSendEmailId.sendEmailId;
      let originalLink = originalLinkWithSendEmailId.originalHref;

      // 把東西解析後存到資料庫
      const recipientBrowser = agent.family;
      const trackingType = "link";
      const recipientCountry = geo.country;
      const allSource = agent.source;
      let recipientPlatform;
      let startIndex = allSource.indexOf("(") + 1;
      let endIndex = allSource.indexOf(";", startIndex);
      let result = allSource.substring(startIndex, endIndex);
      if (result) {
        recipientPlatform = result;
      } else {
        recipientPlatform = allSource;
      }
      let publicIp = ip;
      let refererUrl = req.headers.referer;

      if (refererUrl == null) {
        refererUrl = "undefined";
      }
      let triggerDt = generateTimeNow();
      try {
        await addTrackingMessage(
          sendEmailId,
          trackingType,
          recipientCountry,
          recipientBrowser,
          recipientPlatform,
          publicIp,
          refererUrl,
          triggerDt
        );
      } catch (e) {
        console.log(e);
        const err = new Error();
        err.stack = "cannot addTrackingMessage in sql";
        err.status = 500;
        throw err;
      }
      // 重新導向到原本得網站
      console.log(originalLink);
      res.redirect(originalLink);
    }
  } else {
    next();
  }
}
