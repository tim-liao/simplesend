import {
  getEmailHistory,
  turnTimeZone,
  getUserEmailStatus,
  getUserSuccessSentEmailCount,
  getOpenedEmailCount,
  getUserSentEmailCount,
  getUserTrackingClickInformation,
} from "../model/email_history_model.js";
export async function getUserEmailHistory(req, res, next) {
  const { userId, startTime, endTime, tz } = req.body;
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
    element.time = turnTimeZone(element.time);
  });
  //   console.log(timeCount);
  let output = {};
  timeCount.forEach((e) => {
    let timeToDay = e.time.slice(0, 10);
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
  const { userId } = req.body;
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

  let successRate =
    statusCount.success / (statusCount.success + statusCount.other);

  let successPercent = Number(successRate * 100).toFixed(2) + "%";
  res.status(200).send({ data: successPercent });
}

export async function getTrackingOpenEmailCountRate(req, res, next) {
  const { userId } = req.body;
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
  //   console.log(userSuccessSentEmailCount);
  //   console.log(openedEmailCount);
  let successRate =
    openedEmailCount[0]["COUNT(*)"] /
    (openedEmailCount[0]["COUNT(*)"] +
      userSuccessSentEmailCount[0]["COUNT(*)"]);
  let TrackingEmailCountRate = Number(successRate * 100).toFixed(2) + "%";
  res.status(200).send({ data: TrackingEmailCountRate });
}

export async function getUserSentEmailqty(req, res, next) {
  const { userId } = req.body;
  let originalCount;
  try {
    originalCount = await getUserSentEmailCount(userId);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot get UserEmailStatus from sql";
    err.status = 500;
    throw err;
  }
  // console.log(originalCount);
  let output = { count: originalCount[0]["COUNT(*)"] };
  res.status(200).send({ data: output });
}

export async function getUserSendEmailLog(req, res, next) {
  const { userId } = req.body;
  let originalCount;
  try {
    originalCount = await getUserSendEmailMessage(userId);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot get UserEmailStatus from sql";
    err.status = 500;
    throw err;
  }
  originalCount.forEach((element) => {
    element.time = `${turnTimeZone(element.time)}`.slice(0, -4);
  });
  // console.log(originalCount);

  res.status(200).send({ data: originalCount });
}

export async function getTrackingClickEmailInfor(req, res, next) {
  const { userId } = req.body;
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
  let coutryCount = {};
  let browserCount = {};
  let platformCount = {};

  originalInfor.forEach((e) => {
    let country = e.recipient_country;
    let browser = e.recipient_browser;
    let platform = e.recipient_platform;
    if (coutryCount[country]) {
      coutryCount[country]++;
    } else {
      coutryCount[country] = 1;
    }
    if (browserCount[browser]) {
      browserCount[browser]++;
    } else {
      browserCount[browser] = 1;
    }
    if (platformCount[platform]) {
      platformCount[platform]++;
    } else {
      platformCount[platform] = 1;
    }
  });
  let data = { coutryCount, browserCount, platformCount };
  res.status(200).send({ data });
}
