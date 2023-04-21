import https from "https";
import fs from "fs";

export async function downloadFile(fileUrl, filePath) {
  const file = fs.createWriteStream(filePath);

  const response = await new Promise((resolve, reject) => {
    https.get(fileUrl, (response) => {
      response.pipe(file);

      file.on("finish", () => {
        file.close();
        // console.log("檔案下載完成。");
        resolve(response);
      });

      response.on("error", (err) => {
        reject(err);
      });
    });
  });

  return response;
}

export async function deleteFile(filePath) {
  await new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
  //   console.log("檔案已刪除。");
}
