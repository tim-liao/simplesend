import {
  generateApiKey,
  insertApiKey,
  verifyApiKey,
  generateTimeNow,
  generateTimeSevenDaysLater,
  generateTime365DaysLater,
  updateApiKeyExpiredTimeAndStatus,
  getAllActiveApiKey,
  turnTimeZone,
} from "../model/api_key_model.js";
import Error from "../error/indexError.js";

export async function generateNewApiKey(req, res) {
  const { userId } = req.body.member;
  let selectApiKeyList;
  let timeNow = generateTimeNow();
  selectApiKeyList = await getAllActiveApiKey(userId, timeNow);
  if (selectApiKeyList.length > 1) {
    let oldestApiKey;
    let newerApiKey;
    if (selectApiKeyList[0].expired_time < selectApiKeyList[1].expired_time) {
      oldestApiKey = selectApiKeyList[0].api_key;
      newerApiKey = selectApiKeyList[1].api_key;
    } else {
      oldestApiKey = selectApiKeyList[1].api_key;
      newerApiKey = selectApiKeyList[0].api_key;
    }
    let timeSevenDaysLater = generateTimeSevenDaysLater();
    await updateApiKeyExpiredTimeAndStatus(userId, oldestApiKey, timeNow, 0);
    await updateApiKeyExpiredTimeAndStatus(
      userId,
      newerApiKey,
      timeSevenDaysLater,
      0
    );
  } else if (selectApiKeyList.length === 1) {
    let timeSevenDaysLater = generateTimeSevenDaysLater();
    let apiKey = selectApiKeyList[0].api_key;

    await updateApiKeyExpiredTimeAndStatus(
      userId,
      apiKey,
      timeSevenDaysLater,
      0
    );
  } else {
    throw new Error.BadRequestError("you have to get api key first");
  }
  let newApiKey = await generateApiKey(userId);
  let status = 1;
  let startTime = generateTimeNow();
  let expiredTime = generateTime365DaysLater();
  await insertApiKey(userId, newApiKey, status, startTime, expiredTime);
  res.status(200).send({ data: newApiKey });
}

export async function getAllActiveApiKeyWithExpiredTime(req, res) {
  const { userId } = req.body.member;
  let timeNow = generateTimeNow();
  let originalData = await getAllActiveApiKey(userId, timeNow);
  if (originalData.length === 0) {
    let apiKey = await generateApiKey(userId);
    let status = 1;
    let expiredTime = generateTime365DaysLater();
    await insertApiKey(userId, apiKey, status, timeNow, expiredTime);
    originalData = await getAllActiveApiKey(userId, timeNow);
  } else {
    let checkCatchErrorCount = 0;
    for (let i = 0; i < originalData.length; i++) {
      let apiKeyInDB = originalData[i].api_key;
      try {
        await verifyApiKey(apiKeyInDB);
      } catch (e) {
        if (checkCatchErrorCount === 0) {
          let timeNow = generateTimeNow();
          await updateApiKeyExpiredTimeAndStatus(
            userId,
            apiKeyInDB,
            timeNow,
            0
          );
          let apiKey = await generateApiKey(userId);
          let status = 1;
          let startTime = generateTimeNow();
          let expiredTime = generateTime365DaysLater();
          await insertApiKey(userId, apiKey, status, startTime, expiredTime);
          checkCatchErrorCount++;
        } else {
          let timeNow = generateTimeNow();
          await updateApiKeyExpiredTimeAndStatus(
            userId,
            apiKeyInDB,
            timeNow,
            0
          );
        }
      }
    }
    if (checkCatchErrorCount !== 0) {
      originalData = await getAllActiveApiKey(userId, timeNow);
    }
  }
  originalData.forEach((e) => {
    e.expired_time = turnTimeZone(e.expired_time);
  });
  res.status(200).send({ data: originalData });
}
