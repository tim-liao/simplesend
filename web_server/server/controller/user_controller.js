import {
  selectUserProfile,
  selectUserSettingString,
  generateVerifyString,
  addUserDomainNameWithString,
  generateTimeNow,
  getTxtDNSSetting,
  updateUserDomainNameStatus,
  selectAllUserDomainNameINfo,
  selectDomainName,
  updateUserDNSStatus,
  checkUserEmailUsedOrNot,
  createPasswordHashed,
  createNewUserInfo,
  generateUserAccessToken,
  getPasswordAndUserIdWithNameByEmail,
  checkPassword,
  getUserNameById,
} from "../model/user_model.js";
import Error from "../error/indexError.js";
export async function getUserProfile(req, res) {
  const { userId } = req.body.member;
  let userProfile = await selectUserProfile(userId);

  res.status(200).send({ data: userProfile[0] });
}

export async function userGetStringToStoreInDnsSetting(req, res) {
  const { domainName } = req.body;
  const { userId } = req.body.member;

  //檢查對應的使用者是否有對應的domainName在資料庫
  if (!userId) {
    throw new Error.BadRequestError("miss user id");
  }
  if (!domainName) {
    throw new Error.BadRequestError("miss domain name");
  }

  // 先檢查有沒有其他人有用這個domain name,有的話要拒絕他
  let checkDomainNameUserId = await selectDomainName(domainName);

  if (checkDomainNameUserId.length !== 0) {
    if (checkDomainNameUserId[0].user_id !== userId) {
      throw new Error.BadRequestError(
        "this domain name have already used by other user"
      );
    }
  }
  let getUserSettingString = await selectUserSettingString(userId, domainName);

  let verifyString;
  if (getUserSettingString.length === 0) {
    // 沒有的話就生成一組字串給他，然後儲存到資料庫，並回傳同一組字串給他
    verifyString = generateVerifyString();
    let createdDt = generateTimeNow();

    addUserDomainNameWithString(
      userId,
      domainName,
      "created",
      verifyString,
      createdDt,
      createdDt
    );
  } else {
    // 有的話就抓出來後，丟他應該要setting的字串給他
    verifyString = getUserSettingString[0].setting_string;
    // 因為可能有被刪除過，所以要把狀態改成create

    await updateUserDNSStatus("created", userId, domainName);
  }
  res.status(200).send({ data: { verifyString } });
}

export async function verifyUserDomainName(req, res) {
  const { domainName } = req.body;
  const { userId } = req.body.member;
  // 檢查對應的使用者是否有對應的domainName的string在資料庫
  let getUserDomainName = await selectUserSettingString(userId, domainName);

  if (getUserDomainName.length === 0) {
    //  沒有的話就告訴他要先生成一組字串才可以逕行驗證
    throw new Error.BadRequestError("you have to get verify string first");
  } else {
    // 有的話就驗證是否通過（迴圈驗五次，有通過就回傳驗證成功，並告訴他成功驗證，並更新狀態;沒有驗證成功就回傳失敗）
    let verifyString = getUserDomainName[0].setting_string;
    let txtDNSSetting = [];
    let verifyTime = 20;
    for (let i = 0; i < verifyTime; i++) {
      let originalTxtDNSSetting;
      try {
        originalTxtDNSSetting = await getTxtDNSSetting(domainName);
      } catch (e) {
        break;
      }
      if (originalTxtDNSSetting) {
        txtDNSSetting.push(originalTxtDNSSetting[0][0]);
      }
    }
    if (txtDNSSetting.length === verifyTime) {
      for (let i = 0; i < verifyTime; i++) {
        if (txtDNSSetting[i] !== verifyString) {
          // 因為我驗證多次，只要有一次不符合我的字串，就儲存failed及現在時間到我的資料庫，並回傳失敗給他
          let verifyDt = generateTimeNow();

          await updateUserDomainNameStatus(
            "failed",
            verifyDt,
            userId,
            verifyString,
            domainName
          );
          return res.status(200).send({ data: { verifyStatus: "failed" } });
        } else if (i === verifyTime - 1 && txtDNSSetting[i] === verifyString) {
          let verifyDt = generateTimeNow();
          await updateUserDomainNameStatus(
            "success",
            verifyDt,
            userId,
            verifyString,
            domainName
          );
          return res.status(200).send({ data: { verifyStatus: "success" } });
        }
      }
    } else {
      // 長度不足代表有至少一次回圈失敗，有失敗代表還沒有真的更新完成
      let verifyDt = generateTimeNow();
      await updateUserDomainNameStatus(
        "failed",
        verifyDt,
        userId,
        verifyString,
        domainName
      );
      return res.status(200).send({ data: { verifyStatus: "failed" } });
    }
  }
}

export async function getAllUserDomainNameINfo(req, res) {
  const { userId } = req.body.member;
  // 撈出所有該使用者驗證通過的domain name並回傳
  // 都沒有的話就告訴他沒有任何東西
  let originalData = await selectAllUserDomainNameINfo(userId);

  if (originalData.length === 0) {
    return res
      .status(200)
      .send({ status: 200, message: "you do not have submitted domain name" });
  } else {
    return res.status(200).send({ data: originalData });
  }
}

export async function deleteUserDomainName(req, res) {
  const { domainName } = req.body;
  const { userId } = req.body.member;
  //檢查對應的使用者是否有對應的domainName在資料庫
  if (!userId) {
    throw new Error.BadRequestError("miss user id");
  }
  if (!domainName) {
    throw new Error.BadRequestError("miss domain name");
  }
  // 先檢查有他是不是確實有這個東西，如果不是的話要拒絕他
  let checkString = await selectUserSettingString(userId, domainName);

  if (checkString.length === 0) {
    throw new Error.BadRequestError("you do not have this domain name");
  }
  checkString = checkString[0].setting_string;
  // 如果是的話要就幫他設定成deleted
  let verifyDt = generateTimeNow();

  updateUserDomainNameStatus(
    "deleted",
    verifyDt,
    userId,
    checkString,
    domainName
  );

  res.status(200).send({ data: "successfully deleted" });
}

export async function userSignUp(req, res) {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    throw new Error.BadRequestError(
      "your request lose email , password or name"
    );
  }
  let checkClientDataKeys = Object.keys(req.body);
  for (let i = 0; i < checkClientDataKeys.length; i++) {
    let checkKey = checkClientDataKeys[i];
    if (
      !(checkKey === "email" || checkKey === "password" || checkKey === "name")
    ) {
      throw new Error.BadRequestError(
        "your request cannot include other thing"
      );
    }
  }
  if (email.length > 100) {
    throw new Error.BadRequestError(
      "your email address length should smaller than 100"
    );
  }
  function isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }
  let legalEmailOrNot = isValidEmail(email);
  if (legalEmailOrNot === false) {
    throw new Error.BadRequestError("your email address is not legal");
  }
  // 檢查email有沒有被註冊過
  let checkDBId = await checkUserEmailUsedOrNot(email);

  if (checkDBId.length !== 0) {
    throw new Error.BadRequestError("email already exists");
  }
  // 若是沒註冊過，就可以來把用戶的資料整理後放到資料庫
  // 加密使用者的密碼
  let passwordHashed = await createPasswordHashed(password, 10);

  // 把使用者資料加到資料庫，並且拿回使用者ID
  let originalUserId = await createNewUserInfo(name, email, passwordHashed);

  let userId = originalUserId.insertId;
  // 一般註冊完成就會想要直接登入，所以這邊就是直接給他登入
  // 登入的方式是給他一組3600秒的jwt token，讓他存在本地
  // 裡面會帶user id,user email
  let accessToken = await generateUserAccessToken(userId, email, 3600);

  const data = { access_token: accessToken, access_expired: 3600 };
  const user = { id: userId, name, email };
  // 使用者在註冊成功時會自動產生一組api key

  res.status(200).send({ data, user });
}

export async function userSignIn(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Error.BadRequestError("your request lose email or password");
  }
  let checkClientDataKeys = Object.keys(req.body);
  for (let i = 0; i < checkClientDataKeys.length; i++) {
    let checkKey = checkClientDataKeys[i];
    if (!(checkKey === "email" || checkKey === "password")) {
      throw new Error.BadRequestError(
        "your request cannot include other thing"
      );
    }
  }
  if (email.length > 100) {
    throw new Error.BadRequestError(
      "your email address length should smaller than 100"
    );
  }
  function isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }
  let legalEmailOrNot = isValidEmail(email);
  if (legalEmailOrNot === false) {
    throw new Error.BadRequestError("your email address is not legal");
  }

  // 直接用email撈看看有沒有這個hashedpassword，沒有的話就代表沒有註冊過
  let originalPasswordAndUserIdWithNameInDB =
    await getPasswordAndUserIdWithNameByEmail(email);

  if (originalPasswordAndUserIdWithNameInDB.length == 0) {
    throw new Error.BadRequestError("this email do not sign up our web site");
  }
  let hashedPasswordInDB = originalPasswordAndUserIdWithNameInDB[0].password;
  let sameWordOrNot = await checkPassword(password, hashedPasswordInDB);

  if (sameWordOrNot === true) {
    // 如果是對的，就撈userId, email然後包在access token裡面給他
    let userId = originalPasswordAndUserIdWithNameInDB[0].id;
    let userName = originalPasswordAndUserIdWithNameInDB[0].name;
    let accessToken = await generateUserAccessToken(userId, email, 3600);

    const data = { access_token: accessToken, access_expired: 3600 };
    const user = { id: userId, name: userName, email };

    res.status(200).send({ data, user });
  } else {
    throw new Error.BadRequestError("your password is not correct");
  }
}

export async function getUserName(req, res) {
  const { userId } = req.body.member;

  let originalUserName = await getUserNameById(userId);

  let userName = originalUserName[0].name;
  res.status(200).send({ data: { userName } });
}
