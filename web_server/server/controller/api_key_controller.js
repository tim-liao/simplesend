import {
  genrateAPIKEY,
  getIDByEmail,
  insertApiKey,
  selectApiKey,
  vertifyAPIKEY,
  generateTimeNow,
  generateTimeSevenDaysLater,
  generateTime365DaysLater,
  updateApiKeyexpiredTimeAndStatus,
  getAllActiveApiKey,
  turnTimeZone,
} from "../model/api_key_model.js";

export async function getnewestapikey(req, res) {
  /* #swagger.description = 'Some description...'*/
  const { userId, email } = req.body.member;
  if (!userId) {
    const err = new Error();
    err.stack = "please send user id";
    err.status = 400;
    throw err;
  }
  let dayNow = generateTimeNow();
  let selectApiKeyInDB;
  try {
    selectApiKeyInDB = await selectApiKey(userId, 1, dayNow);
  } catch (e) {
    console.log(e);
    const err = new Error();
    err.stack = "cannot selectApiKey from sql";
    err.status = 500;
    throw err;
  }
  let apiKey;
  if (selectApiKeyInDB.length == 0) {
    try {
      apiKey = await genrateAPIKEY(userId);
    } catch (e) {
      const err = new Error();
      err.stack = "cannot genrate API KEY";
      err.status = 500;
      throw err;
    }
    let status = 1;

    let expiredTime = generateTime365DaysLater();
    try {
      await insertApiKey(userId, apiKey, status, dayNow, expiredTime);
    } catch (e) {
      console.log(e);
      const err = new Error();
      err.stack = "cannot insert API KEY with user";
      err.status = 500;
      throw err;
    }
  } else {
    //TODO:檢查是否過期，過期再生成新的，沒有過期就不生成新的，直接傳舊的給他

    let apiKeyInDB = selectApiKeyInDB[0].api_key;
    let decoded;
    try {
      decoded = await vertifyAPIKEY(apiKeyInDB);
    } catch (e) {
      if (!(e.message == "jwt expired")) {
        const err = new Error("there is something wrong with api key");
        err.stack = "there is something wrong with api key";
        err.status = 500;
        throw err;
      } else {
        try {
          apiKey = await genrateAPIKEY(userId);
        } catch (e) {
          const err = new Error();
          err.stack = "cannot genrate API KEY";
          err.status = 500;
          throw err;
        }
        let status = 1;
        let startTime = generateTimeNow();
        let expiredTime = generateTime365DaysLater();
        try {
          await insertApiKey(userId, apiKey, status, startTime, expiredTime);
        } catch (e) {
          const err = new Error();
          err.stack = "cannot insert API KEY with user";
          err.status = 500;
          throw err;
        }
        return res.status(200).send({ data: apiKey });
      }
    }
    // 如果資料庫裡面的沒過期就會走到這步，然後因為資料庫裡的沒有過期，所以直接回傳給他
    apiKey = apiKeyInDB;
  }

  res.status(200).send({ data: apiKey });
}

export async function generatenewapikey(req, res) {
  const { userId, email } = req.body.member;
  if (!userId) {
    const err = new Error();
    err.stack = "please send user id";
    err.status = 400;
    throw err;
  }
  let selectApiKeyList;
  let timeNow = generateTimeNow();

  try {
    selectApiKeyList = await getAllActiveApiKey(userId, timeNow);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot selectApiKeyFromOldList";
    err.status = 500;
    throw err;
  }
  if (selectApiKeyList.length > 1) {
    // 檢查他七天內有沒有進行刪除
    // 有效的key超過１把，就代表七天內有做過了
    // console.log(selectApiKeyList);

    // const err = new Error();
    // err.stack = "you have genarated a new api key in 7 days";
    // err.status = 400;
    // throw err;
    //////
    // 若是七天內有進行生成的話
    // 代表有兩把key
    // 就把舊的那把改成現在到期
    // 比較新的那把改成七天後到期
    // 然後生成一把新的key是一年後到期
    let oldestApiKey;
    let moreNewApiKey;
    if (selectApiKeyList[0].expired_time < selectApiKeyList[1].expired_time) {
      oldestApiKey = selectApiKeyList[0].api_key;
      moreNewApiKey = selectApiKeyList[1].api_key;
    } else {
      oldestApiKey = selectApiKeyList[1].api_key;
      moreNewApiKey = selectApiKeyList[0].api_key;
    }
    // 把舊的apikey過期時間改掉
    let timeSevenDaysLater = generateTimeSevenDaysLater();
    try {
      await updateApiKeyexpiredTimeAndStatus(userId, oldestApiKey, timeNow, 0);
    } catch (e) {
      console.log(e);
      const err = new Error();
      err.stack = "cannot updateApiKeyexpiredTime in sql";
      err.status = 500;
      throw err;
    }
    try {
      await updateApiKeyexpiredTimeAndStatus(
        userId,
        moreNewApiKey,
        timeSevenDaysLater,
        0
      );
    } catch (e) {
      console.log(e);
      const err = new Error();
      err.stack = "cannot updateApiKeyexpiredTime in sql";
      err.status = 500;
      throw err;
    }
    // 生成新的api key放到資料庫
    let newApiKey;
    try {
      newApiKey = await genrateAPIKEY(userId);
    } catch (e) {
      const err = new Error();
      err.stack = "cannot generate API KEY";
      err.status = 500;
      throw err;
    }
    let status = 1;
    let startTime = generateTimeNow();
    let expiredTime = generateTime365DaysLater();
    try {
      await insertApiKey(userId, newApiKey, status, startTime, expiredTime);
    } catch (e) {
      const err = new Error();
      err.stack = "cannot insert API KEY with user";
      err.status = 500;
      throw err;
    }
    return res.status(200).send({ data: newApiKey });
  } else if (selectApiKeyList.length == 0) {
    const err = new Error();
    err.stack = "you have to  get api key first";
    err.status = 400;
    throw err;
  } else if (selectApiKeyList.length == 1) {
    let timeSevenDaysLater = generateTimeSevenDaysLater();
    let apiKey = selectApiKeyList[0].api_key;
    // 把舊的apikey過期時間改掉
    try {
      await updateApiKeyexpiredTimeAndStatus(
        userId,
        apiKey,
        timeSevenDaysLater,
        0
      );
    } catch (e) {
      console.log(e);
      const err = new Error();
      err.stack = "cannot updateApiKeyexpiredTime in sql";
      err.status = 500;
      throw err;
    }
    // 生成新的api key放到資料庫
    let newApiKey;
    try {
      newApiKey = await genrateAPIKEY(userId);
    } catch (e) {
      const err = new Error();
      err.stack = "cannot generate API KEY";
      err.status = 500;
      throw err;
    }
    let status = 1;
    let startTime = generateTimeNow();
    let expiredTime = generateTime365DaysLater();
    try {
      await insertApiKey(userId, newApiKey, status, startTime, expiredTime);
    } catch (e) {
      const err = new Error();
      err.stack = "cannot insert API KEY with user";
      err.status = 500;
      throw err;
    }
    return res.status(200).send({ data: newApiKey });
  }
}

export async function getAllActiveApiKeyWithExpiredTime(req, res) {
  const { userId, email } = req.body.member;
  if (!userId) {
    const err = new Error();
    err.stack = "please send user id";
    err.status = 400;
    throw err;
  }
  let timeNow = generateTimeNow();
  let originalData;
  try {
    originalData = await getAllActiveApiKey(userId, timeNow);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot getAllActiveApiKeyData from sql";
    err.status = 500;
    throw err;
  }
  // console.log(originalData);
  if (originalData.length == 0) {
    const err = new Error();
    err.stack = "you have to  get api key first";
    err.status = 400;
    throw err;
  }
  originalData.forEach((e) => {
    e.expired_time = turnTimeZone(e.expired_time);
  });

  res.status(200).send({ data: originalData });
}
