import {
  checkHTMLIsIncludeTrackingLinkOrNot,
  generateRandomString,
} from "../server/model/send_email_model.js";
it("check  checkHTMLIsIncludeTrackingLinkOrNot （１）", () => {
  let html = `帶個附件
  <a href="https://google.com">再帶個google首頁</a>`;
  let link = "https://google.com";
  expect(checkHTMLIsIncludeTrackingLinkOrNot(link, html)).toBe(1);
});

it("check  checkHTMLIsIncludeTrackingLinkOrNot （２）", () => {
  let html = `<a href="https://www.youtube.com">這應該是youtube影片</a>
  <hr/>
  <a href="https://google.com">這應該是google首頁</a>
  <hr/>
  <a href="https://google.com">這應該是google首頁</a>`;
  let link = "https://google.com";
  expect(checkHTMLIsIncludeTrackingLinkOrNot(link, html)).toBe(2);
});

it("check  generateRandomString （１）", () => {
  expect(generateRandomString(10)).toHaveLength(10);
});
