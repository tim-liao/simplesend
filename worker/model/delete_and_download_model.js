import https from "https";
import fs from "fs";
import { promisify } from "util";
export async function downloadFile(fileUrl, filePath) {
  const file = fs.createWriteStream(filePath);
  const response = await new Promise((resolve, reject) => {
    https.get(fileUrl, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close();
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
  const unlink = promisify(fs.unlink);
  await unlink(filePath);
}
