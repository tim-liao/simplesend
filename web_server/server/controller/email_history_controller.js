import {
  getEmailHistory,
  turnTimeZone,
  getUserEmailStatus,
  getUserSuccessSentEmailCount,
  getOpenedEmailCount,
} from "../model/email_history_model.js";

export async function getUserEmailHistory(req, res, next) {
  const { userId, startTime, endTime } = req.body;
  //   console.log(userId, startTime, endTime);
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
  //   console.log(output);
  res.status(200).send({ data: output });
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
