import * as cheerio from "cheerio";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export function transformToTrackedHTML(html, sendEmailId, trackingLink) {
  //
  const $ = cheerio.load(html);
  $("a").each(function (i, elem) {
    const href = $(this).attr("href");
    if (href == trackingLink) {
      const SECRET = process.env.TRACK_LINK_SECRET;
      const token = jwt.sign(
        {
          sendEmailId: sendEmailId,
          originalHref: href,
        },
        SECRET,
        {
          expiresIn: "1000d",
        }
      );

      const newHref =
        `${process.env.ADRESS}${process.env.TRACKING_LINK_PATH}?link=` + token;
      $(this).attr("href", newHref);
    }
  });
  let output = $.html();
  return output;

  // 上面這串就是已經變動後得html
}
