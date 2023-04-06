import {
  genrateAPIKEY,
  getIDByEmail,
  insertApiKey,
  selectApiKey,
  updateApiKey,
  vertifyAPIKEY,
  insertApiKeytoOldList,
  selectApiKeyOldList,
  generateTimeNow,
  generateTimeSevenDaysAgo,
} from "../model/api_key_model.js";

export async function getapikey(req, res) {
  let { email } = req.body;
  let originaluserId;
  //   console.log(email);
  try {
    originaluserId = await getIDByEmail(email);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot get id from sql";
    err.status = 500;
    throw err;
  }

  if (originaluserId.length == 0) {
    const err = new Error();
    err.stack = "you donot sign up our service ";
    err.status = 500;
    throw err;
  }
  let userId = originaluserId[0].id;

  let selectApiKeyInDB;
  try {
    selectApiKeyInDB = await selectApiKey(userId);
  } catch (e) {
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
    try {
      await insertApiKey(userId, apiKey);
    } catch (e) {
      const err = new Error();
      err.stack = "cannot insert API KEY with user";
      err.status = 500;
      throw err;
    }
  } else {
    //TODO:檢查是否過期，過期再生成新的，沒有過期就不生成新的，直接傳舊的給他

    let apiKeyInDB = selectApiKeyInDB[0].API_key;
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
        try {
          await updateApiKey(userId, apiKey);
        } catch (e) {
          const err = new Error();
          err.stack = "cannot udpate API KEY with user";
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
  let { email } = req.body;
  let originaluserId;
  //   console.log(email);
  try {
    originaluserId = await getIDByEmail(email);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot get id from sql";
    err.status = 500;
    throw err;
  }

  if (originaluserId.length == 0) {
    const err = new Error();
    err.stack = "you donot sign up our web service ";
    err.status = 500;
    throw err;
  }
  let userId = originaluserId[0].id;
  let selectApiKeyFromOldList;
  let timeNow = generateTimeNow();
  let timeSevenDaysAgo = generateTimeSevenDaysAgo();
  try {
    selectApiKeyFromOldList = await selectApiKeyOldList(
      userId,
      timeSevenDaysAgo
    );
  } catch (e) {
    const err = new Error();
    err.stack = "cannot selectApiKeyFromOldList";
    err.status = 500;
    throw err;
  }
  if (selectApiKeyFromOldList.length > 0) {
    // 檢查他七天內有沒有進行刪除
    const err = new Error();
    err.stack = "you have genarated a new api key in 7 days";
    err.status = 500;
    throw err;
  }
  let selectApiKeyInDB;

  try {
    selectApiKeyInDB = await selectApiKey(userId);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot selectApiKey from sql";
    err.status = 500;
    throw err;
  }
  let apiKeyInDB = selectApiKeyInDB[0].API_key;
  try {
    await insertApiKeytoOldList(userId, apiKeyInDB, timeNow);
  } catch (e) {
    console.log(e);
    const err = new Error();
    err.stack = "cannot insertApiKeytoOldList";
    err.status = 500;
    throw err;
  }
  let apiKey;
  try {
    apiKey = await genrateAPIKEY(userId);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot genrate API KEY";
    err.status = 500;
    throw err;
  }
  try {
    await updateApiKey(userId, apiKey);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot udpate API KEY with user";
    err.status = 500;
    throw err;
  }
  res.status(200).send({ data: apiKey });
}
