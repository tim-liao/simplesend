import {
  getEmailHistory,
  turnTimeZone,
  getUserEmailStatus,
  getUserSuccessSentEmailCount,
  getOpenedEmailCount,
  getUserSentEmailCount,
  getUserTrackingClickInformation,
  getUserSendEmailMessage,
  getUserEmailSendActionFromSNS,
} from "../model/email_history_model.js";
export async function getUserEmailHistory(req, res, next) {
  const { startTime, endTime, tz } = req.body;
  const { userId, email } = req.body.member;
  // console.log(userId, startTime, endTime);
  // 把前端的時間搭配時區轉成台灣時區的時間
  // output要再轉回去
  let timeCount;
  try {
    timeCount = await getEmailHistory(userId, startTime, endTime);
    // 撈出來的資料是UTC+0的時間
  } catch (e) {
    const err = new Error();
    err.stack = "cannot get EmailHistory from sql";
    err.status = 500;
    throw err;
  }
  // console.log(timeCount);
  timeCount.forEach((element) => {
    element.created_dt = turnTimeZone(element.created_dt);
  });
  //   console.log(timeCount);
  let output = {};
  timeCount.forEach((e) => {
    let timeToDay = e.created_dt.slice(0, 10);
    // console.log(timeToDay);
    if (output[timeToDay]) {
      output[timeToDay]++;
    } else {
      output[timeToDay] = 1;
    }
  });
  function generateDateRange(start, end) {
    let dateArray = [];
    let currentDate = new Date(start);
    // console.log(currentDate);
    while (currentDate <= new Date(end)) {
      dateArray.push(currentDate.toISOString().slice(0, 10));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  }
  const dateRange = generateDateRange(startTime, endTime);
  // console.log(dateRange);
  let realOutPut = {};
  dateRange.forEach((e) => {
    if (output[e]) {
      realOutPut[e] = output[e];
    } else {
      realOutPut[e] = 0;
    }
  });

  res.status(200).send({ data: realOutPut });
}

export async function getSuccessRate(req, res, next) {
  const { userId, email } = req.body.member;
  let eachStatus;
  try {
    eachStatus = await getUserEmailStatus(userId);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot get UserEmailStatus from sql";
    err.status = 500;
    throw err;
  }
  let statusCount = { success: 0, other: 0 };
  eachStatus.forEach((e) => {
    let status = e.send_status;
    if (status == "success") {
      statusCount.success++;
    } else {
      statusCount.other++;
    }
  });

  let allCount = statusCount.success + statusCount.other;
  let successRate = statusCount.success / allCount;

  let successPercent = Number(successRate * 100).toFixed(2) + "%";
  if (allCount == 0) {
    successPercent = "0%";
  }
  res.status(200).send({ data: successPercent });
}

export async function getTrackingOpenEmailCountRate(req, res, next) {
  const { userId, email } = req.body.member;
  // 拿到寄件者全部成功的寄信數量
  let userSuccessSentEmailCount;
  let openedEmailCount;
  try {
    userSuccessSentEmailCount = await getUserSuccessSentEmailCount(userId);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot get userSuccessSentEmailCount from sql";
    err.status = 500;
    throw err;
  }
  //   拿到寄件者寄出信件的已開信數量
  try {
    openedEmailCount = await getOpenedEmailCount(userId);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot get openedEmailCount from sql";
    err.status = 500;
    throw err;
  }
  let allCount =
    openedEmailCount[0]["COUNT(*)"] + userSuccessSentEmailCount[0]["COUNT(*)"];
  let successRate = openedEmailCount[0]["COUNT(*)"] / allCount;

  let TrackingEmailCountRate = Number(successRate * 100).toFixed(2) + "%";
  if (allCount == 0) {
    TrackingEmailCountRate = "0%";
  }
  res.status(200).send({ data: TrackingEmailCountRate });
}

export async function getUserSentEmailqty(req, res, next) {
  const { userId, email } = req.body.member;
  let originalCount;
  try {
    originalCount = await getUserSentEmailCount(userId);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot get UserSentEmailCount from sql";
    err.status = 500;
    throw err;
  }
  // console.log(originalCount);
  let output = { count: originalCount[0]["COUNT(*)"] };
  res.status(200).send({ data: output });
}

export async function getUserSendEmailLog(req, res, next) {
  const { userId, email } = req.body.member;
  let originalCount;
  try {
    originalCount = await getUserSendEmailMessage(userId);
  } catch (e) {
    console.log(e);
    const err = new Error();
    err.stack = "cannot get UserSendEmailMessage from sql";
    err.status = 500;
    throw err;
  }
  originalCount.forEach((element) => {
    element.created_dt = `${turnTimeZone(element.created_dt)}`.slice(0, -4);
  });
  // console.log(originalCount);

  res.status(200).send({ data: originalCount });
}

export async function getTrackingClickEmailInfor(req, res, next) {
  const { userId, email } = req.body.member;
  //  TODO:用使用者id去撈使用者emailid，在用emailid去撈使用者的counrty,browser,platform
  let originalInfor;
  try {
    originalInfor = await getUserTrackingClickInformation(userId);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot get UserTrackingClickInformation from sql";
    err.status = 500;
    throw err;
  }
  let country = {};
  let browser = {};
  let platform = {};

  originalInfor.forEach((e) => {
    let orignailCountry = e.recipient_country;
    let originalBrowser = e.recipient_browser;
    let originalPlatform = e.recipient_platform;
    if (country[orignailCountry]) {
      country[orignailCountry]++;
    } else {
      country[orignailCountry] = 1;
    }
    if (browser[originalBrowser]) {
      browser[originalBrowser]++;
    } else {
      browser[originalBrowser] = 1;
    }
    if (platform[originalPlatform]) {
      platform[originalPlatform]++;
    } else {
      platform[originalPlatform] = 1;
    }
  });
  let data = { country, browser, platform };
  res.status(200).send({ data });
}

export async function getSuccessDeliveryRate(req, res, next) {
  const { userId, email } = req.body.member;
  let eachStatus;
  try {
    eachStatus = await getUserEmailSendActionFromSNS(userId);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot get UserEmailSendActionFromSNS from sql";
    err.status = 500;
    throw err;
  }
  let statusCount = { success: 0, other: 0 };
  eachStatus.forEach((e) => {
    let status = e.action;
    if (status == "success") {
      statusCount.success++;
    } else {
      statusCount.other++;
    }
  });

  let allCount = statusCount.success + statusCount.other;
  let successRate = statusCount.success / allCount;

  let successPercent = Number(successRate * 100).toFixed(2) + "%";
  if (allCount == 0) {
    successPercent = "0%";
  }
  res.status(200).send({ data: successPercent });
}
