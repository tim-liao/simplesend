import {
  getEmailHistory,
  turnTimeZone,
  getUserEmailStatus,
  getUserSuccessSentEmailCount,
  getOpenedEmailCount,
  getUserSentEmailCount,
  getUserFailedEmailMessage,
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
  let statusCount = {};
  eachStatus.forEach((e) => {
    let status = e.status;
    if (statusCount[status]) {
      statusCount[status]++;
    } else {
      statusCount[status] = 1;
    }
  });
  //   console.log(statusCount);
  let successRate = statusCount["1"] / (statusCount["1"] + statusCount["0"]);
  let successPercent = Number(successRate * 100).toFixed(2) + "%";
  res.status(200).send({ data: successPercent });
}

export async function getTrackingEmailCountRate(req, res, next) {
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
  //   拿到寄件者寄出信件的開信數量
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

export async function getUserFailedEmailLog(req, res, next) {
  const { userId } = req.body;
  let originalCount;
  try {
    originalCount = await getUserFailedEmailMessage(userId);
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
