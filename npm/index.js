import fs from "fs";
import { fileTypeFromFile } from "file-type";
import path from "path";
import fetch from "node-fetch";
import https from "https";
export function sendemailwithattachment(emailBody, filePath, apiKey) {
  let body = emailBody;
  let { user_id } = body;
  let headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  fs.stat(filePath, async (err, stats) => {
    if (err) {
      console.error(err);
      return;
    }
    const fileSize = stats.size;
    console.log(`檔案大小：${fileSize} bytes`);
    if (fileSize >= 10485760) {
      return "cannot upload bigger than 10MB";
    } else {
      ////
      /////
      //////fileTypeFromFile

      // TODO:檔名把最後面的東西拆下來就好
      const fileName = path.basename(filePath);
      let aa = await fileTypeFromFile(fileName);
      const type = aa.mime;
      body.attachmentDataType = type;
      body.attachmentDataLength = fileSize;
      body.attachmentDataName = fileName;

      fetch(
        `https://side-project2023.online/api/1.0/sentrawmail?APIKEY=${apiKey}`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(body),
        }
      )
        .then((response) => response.json())
        .then(function (json) {
          let data = json.data;
          if (data) {
            let { attachmentId, url } = data;
            const options = {
              method: "PUT",
              headers: {
                "Content-Type": "application/octet-stream",
                "Content-Length": fileSize,
              },
            };
            const req = https.request(url, options, function (res) {
              if (res.statusCode == 200) {
                console.log(`上傳成功：${res.statusCode}`);
              }
              // 回傳statusCode\statusMessage\attachmentId給後端
              const qqBody = {
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                attachmentId,
                user_id,
              };
              let qqheaders = {
                "Content-Type": "application/json",
                Accept: "application/json",
              };
              fetch(
                `https://side-project2023.online/api/1.0/responseFromrawmailUploadToS3?APIKEY=${apiKey}`,
                {
                  method: "POST",
                  headers: qqheaders,
                  body: JSON.stringify(qqBody),
                }
              )
                .then((response) => response.json())
                .then(function (json) {
                  let { data } = json;
                  if (data) {
                    console.log(json);
                  } else {
                    console.error(json);
                  }
                });
            });
            fs.createReadStream(filePath).pipe(req);
          } else {
            let { status, message } = json;
            console.error(json);
          }
        });
    }
  });
}
export function sendonlyemail(emailBody, apiKey) {
  let body = emailBody;
  let headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  fetch(`https://side-project2023.online/api/1.0/sentmail?APIKEY=${apiKey}`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
}
