import {
  selectUserProfile,
  selectUserSettingString,
  genrateVerifyString,
  addUserDomainNameWithString,
  generateTimeNow,
  getTxtDNSSetting,
  updateUserDomainNameStatus,
  selectAllUserDomainNameINfor,
  selectDomainName,
  updateUserDNSStatus,
  checkUserEmailUsedOrNot,
  createPasswordHashed,
  createNewUserInfor,
  genrateUserAccessToken,
  getPasswordAndUserIdWithNameByEmail,
  checkPassword,
  getUserNameById,
} from "../model/user_model.js";

export async function getUserProfile(req, res, next) {
  const { userId, email } = req.body.member;
  let userProfile;
  try {
    userProfile = await selectUserProfile(userId);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot get userProfile from sql";
    err.status = 500;
    throw err;
  }

  res.status(200).send({ data: userProfile[0] });
}

export async function userGetStringToStoreInDnsSetting(req, res, next) {
  const { domainName } = req.body;
  const { userId, email } = req.body.member;

  //檢查對應的使用者是否有對應的domainName在資料庫
  if (!userId) {
    const err = new Error();
    err.stack = "miss user id";
    err.status = 400;
    throw err;
  }
  if (!domainName) {
    const err = new Error();
    err.stack = "miss domain name";
    err.status = 400;
    throw err;
  }

  // 先檢查有沒有其他人有用這個domainname,有的話要拒絕他
  let checkDomainNameUserId;
  try {
    checkDomainNameUserId = await selectDomainName(domainName);
  } catch (e) {
    console.log(e);
    const err = new Error();
    err.stack = "cannot selectDomainName from sql";
    err.status = 500;
    throw err;
  }
  if (checkDomainNameUserId.length != 0) {
    if (checkDomainNameUserId[0].user_id != userId) {
      const err = new Error();
      err.stack = "this domain name have aleardy used by other user";
      err.status = 400;
      throw err;
    }
  }
  let getUserSettingString;
  try {
    getUserSettingString = await selectUserSettingString(userId, domainName);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot get selectUserSettingString from sql";
    err.status = 500;
    throw err;
  }
  let verifyString;
  if (getUserSettingString.length == 0) {
    // 沒有的話就生成一組字串給他，然後儲存到資料庫，並回傳同一組字串給他
    verifyString = genrateVerifyString();
    let createdDt = generateTimeNow();
    try {
      addUserDomainNameWithString(
        userId,
        domainName,
        "created",
        verifyString,
        createdDt,
        createdDt
      );
    } catch (e) {
      const err = new Error();
      err.stack = "cannot addUserDomainNameWithString to sql";
      err.status = 500;
      throw err;
    }
  } else {
    // 有的話就抓出來後，丟他應該要setting的字串給他
    verifyString = getUserSettingString[0].setting_string;
    // 因為可能有被刪除過，所以要把狀態改成create
    try {
      await updateUserDNSStatus("created", userId, domainName);
    } catch (e) {
      const err = new Error();
      err.stack = "cannot updateUserDNSStatus to created to sql";
      err.status = 500;
      throw err;
    }
  }
  res.status(200).send({ data: { verifyString } });
}

export async function verifyUserDomainName(req, res, next) {
  const { domainName } = req.body;
  const { userId, email } = req.body.member;
  // 檢查對應的使用者是否有對應的domainName的string在資料庫
  let getUserDomainName;
  try {
    getUserDomainName = await selectUserSettingString(userId, domainName);
  } catch (e) {
    console.log(e);
    const err = new Error();
    err.stack = "cannot get userDomainName from sql";
    err.status = 500;
    throw err;
  }
  if (getUserDomainName.length == 0) {
    //  沒有的話就告訴他要先生成一組字串才可以逕行驗證
    const err = new Error();
    err.stack = "you have to get verify string first";
    err.status = 400;
    throw err;
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
    // console.log(txtDNSSetting);
    // console.log(verifyString);
    if (txtDNSSetting.length == verifyTime) {
      for (let i = 0; i < verifyTime; i++) {
        if (txtDNSSetting[i] != verifyString) {
          // 因為我驗證多次，只要有一次不符合我的字串，就儲存failed及現在時間到我的資料庫，並回傳失敗給他
          let verifyDt = generateTimeNow();
          try {
            await updateUserDomainNameStatus(
              "failed",
              verifyDt,
              userId,
              verifyString,
              domainName
            );
          } catch (e) {
            const err = new Error();
            err.stack = "cannot update user domain name status in sql";
            err.status = 500;
            throw err;
          }
          return res.status(200).send({ data: { verifyStatus: "failed" } });
        } else if (i == verifyTime - 1 && txtDNSSetting[i] == verifyString) {
          let verifyDt = generateTimeNow();
          try {
            await updateUserDomainNameStatus(
              "success",
              verifyDt,
              userId,
              verifyString,
              domainName
            );
          } catch (e) {
            const err = new Error();
            err.stack = "cannot update user domain name status in sql";
            err.status = 500;
            throw err;
          }
          return res.status(200).send({ data: { verifyStatus: "success" } });
        }
      }
    } else {
      // 長度不足代表有至少一次回圈失敗，有失敗代表還沒有真的更新完成
      let verifyDt = generateTimeNow();
      try {
        await updateUserDomainNameStatus(
          "failed",
          verifyDt,
          userId,
          verifyString,
          domainName
        );
      } catch (e) {
        const err = new Error();
        err.stack = "cannot update user domain name status in sql";
        err.status = 500;
        throw err;
      }
      return res.status(200).send({ data: { verifyStatus: "failed" } });
    }
  }
}

export async function getAllUserDomainNameINfor(req, res, next) {
  const { userId, email } = req.body.member;
  // 撈出所有該使用者驗證通過的domainname並回傳
  // 都沒有的話就告訴他沒有任何東西
  let originalData;
  try {
    originalData = await selectAllUserDomainNameINfor(userId);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot selectAllSuccessUserDomainName from sql";
    err.status = 500;
    throw err;
  }
  if (originalData.length == 0) {
    return res
      .status(200)
      .send({ status: 200, message: "you donot have submitted domain name" });
  } else {
    return res.status(200).send({ data: originalData });
  }
}

export async function deleteUserDomainName(req, res, next) {
  const { domainName } = req.body;
  const { userId, email } = req.body.member;
  //檢查對應的使用者是否有對應的domainName在資料庫
  if (!userId) {
    const err = new Error();
    err.stack = "miss user id";
    err.status = 400;
    throw err;
  }
  if (!domainName) {
    const err = new Error();
    err.stack = "miss domain name";
    err.status = 400;
    throw err;
  }
  // 先檢查有他是不是確實有這個東西，如果不是的話要拒絕他
  let checkString;
  try {
    checkString = await selectUserSettingString(userId, domainName);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot selectUserSettingString from sql";
    err.status = 500;
    throw err;
  }

  if (checkString.length == 0) {
    const err = new Error();
    err.stack = "you donot have this domain name";
    err.status = 400;
    throw err;
  }
  checkString = checkString[0].setting_string;
  // 如果是的話要就幫他設定成deleted
  let verifyDt = generateTimeNow();
  try {
    updateUserDomainNameStatus(
      "deleted",
      verifyDt,
      userId,
      checkString,
      domainName
    );
  } catch (e) {
    console.log(e);
    const err = new Error();
    err.stack = "cannot updateUserDomainNameStatus  to deleted in sql";
    err.status = 500;
    throw err;
  }

  res.status(200).send({ data: "successfully deleted" });
}

export async function userSignUp(req, res, next) {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    const err = new Error();
    err.stack = "your requst lose email , password or name";
    err.status = 400;
    throw err;
  }
  let checkClientDataKeys = Object.keys(req.body);
  for (let i = 0; i < checkClientDataKeys.length; i++) {
    let checkKey = checkClientDataKeys[i];
    if (
      !(checkKey == "email" || checkKey == "password" || checkKey == "name")
    ) {
      const err = new Error();
      err.stack = "your requst cannot include other thing";
      err.status = 400;
      throw err;
    }
  }
  if (email.length > 100) {
    const err = new Error();
    err.stack = "your email address length should smaller than 100";
    err.status = 400;
    throw err;
  }
  function isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }
  let legalEmailOrNot = isValidEmail(email);
  if (legalEmailOrNot == false) {
    const err = new Error();
    err.stack = "your email address is not legal";
    err.status = 400;
    throw err;
  }
  // 檢查email有沒有被註冊過
  let checkDBId;
  try {
    checkDBId = await checkUserEmailUsedOrNot(email);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot checkUserEmailUsedOrNot from sql";
    err.status = 500;
    throw err;
  }
  if (checkDBId.length != 0) {
    const err = new Error();
    err.stack = "Email Already Exists";
    err.status = 400;
    throw err;
  }
  // 若是沒註冊過，就可以來把用戶的資料整理後放到資料庫
  // 加密使用者的密碼
  let passwordHashed;
  try {
    passwordHashed = await createPasswordHashed(password, 10);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot createPasswordHashed ";
    err.status = 500;
    throw err;
  }

  // 把使用者資料加到資料庫，並且拿回使用者ID
  let originalUserId;
  try {
    originalUserId = await createNewUserInfor(name, email, passwordHashed);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot createNewUserInfor from sql";
    err.status = 500;
    throw err;
  }
  let userId = originalUserId.insertId;
  // 一般註冊完成就會想要直接登入，所以這邊就是直接給他登入
  // 登入的方式是給他一組3600秒的jwttoken，讓他存在本地
  // 裡面會帶userid,useremail
  let accessToken;
  try {
    accessToken = await genrateUserAccessToken(userId, email, 3600);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot genrateUserAccessToken";
    err.status = 500;
    throw err;
  }
  const data = { access_token: accessToken, acces_expired: 3600 };
  const user = { id: userId, name, email };
  // 使用者在註冊成功時會自動產生一組api key

  res.status(200).send({ data, user });
}

export async function userSignIn(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    const err = new Error();
    err.stack = "your requst lose email or password";
    err.status = 400;
    throw err;
  }
  let checkClientDataKeys = Object.keys(req.body);
  for (let i = 0; i < checkClientDataKeys.length; i++) {
    let checkKey = checkClientDataKeys[i];
    if (!(checkKey == "email" || checkKey == "password")) {
      const err = new Error();
      err.stack = "your requst cannot include other thing";
      err.status = 400;
      throw err;
    }
  }
  if (email.length > 100) {
    const err = new Error();
    err.stack = "your email address length should smaller than 100";
    err.status = 400;
    throw err;
  }
  function isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }
  let legalEmailOrNot = isValidEmail(email);
  if (legalEmailOrNot == false) {
    const err = new Error();
    err.stack = "your email address is not legal";
    err.status = 400;
    throw err;
  }

  // 直接用email撈看看有沒有這個hashedpassword，沒有的話就代表沒有註冊過
  let originalPasswordAndUserIdWithNameInDB;
  try {
    originalPasswordAndUserIdWithNameInDB =
      await getPasswordAndUserIdWithNameByEmail(email);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot checkUserEmailUsedOrNot from sql";
    err.status = 500;
    throw err;
  }
  if (originalPasswordAndUserIdWithNameInDB.length == 0) {
    const err = new Error();
    err.stack = "this email donot sign up our web site";
    err.status = 400;
    throw err;
  }
  let hashedPasswordInDB = originalPasswordAndUserIdWithNameInDB[0].password;
  let sameWordOrNot;
  try {
    sameWordOrNot = await checkPassword(password, hashedPasswordInDB);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot checkPassword by bcrypt";
    err.status = 500;
    throw err;
  }
  if (sameWordOrNot == true) {
    // 如果是對的，就撈userId, email然後包在accesstoken裡面給他
    let userId = originalPasswordAndUserIdWithNameInDB[0].id;
    let userName = originalPasswordAndUserIdWithNameInDB[0].name;
    let accessToken;
    try {
      accessToken = await genrateUserAccessToken(userId, email, 3600);
    } catch (e) {
      const err = new Error();
      err.stack = "cannot genrateUserAccessToken by jwt";
      err.status = 500;
      throw err;
    }
    const data = { access_token: accessToken, acces_expired: 3600 };
    const user = { id: userId, name: userName, email };

    res.status(200).send({ data, user });
  } else {
    const err = new Error();
    err.stack = "your password is not correct";
    err.status = 400;
    throw err;
  }
}

export async function getUserName(req, res, next) {
  const { userId, email } = req.body.member;

  let originalUserName;
  try {
    originalUserName = await getUserNameById(userId);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot getUserNameById from sql";
    err.status = 500;
    throw err;
  }
  let userName = originalUserName[0].name;
  res.status(200).send({ data: { userName } });
}
