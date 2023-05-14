import {
  getEmailHistoryQty,
  turnTimeZone,
  getUserEmailStatus,
  getUserSuccessSentEmailCount,
  getOpenedEmailCount,
  getUserSentEmailCount,
  getUserTrackingClickInformation,
  getUserSendEmailMessageWithoutAttachment,
  getUserEmailSendActionFromSNS,
  getUserSendEmailWithAttachment,
  getUserSendEmailBounceMessage,
} from "../model/email_history_model.js";
export async function getUserEmailHistoryQty(req, res) {
  const { startTime, endTime } = req.body;
  const { userId } = req.body.member;
  let timeCount = await getEmailHistoryQty(userId, startTime, endTime);
  // 撈出來的資料是UTC+0的時間
  timeCount.forEach((element) => {
    element.created_dt = turnTimeZone(element.created_dt);
  });
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
    while (currentDate <= new Date(end)) {
      dateArray.push(currentDate.toISOString().slice(0, 10));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
  }
  const dateRange = generateDateRange(startTime, endTime);
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

export async function getSuccessRate(req, res) {
  const { userId } = req.body.member;
  let eachStatus;

  eachStatus = await getUserEmailStatus(userId);

  let statusCount = { success: 0, other: 0 };
  eachStatus.forEach((e) => {
    let status = e.send_status;
    if (status === "success") {
      statusCount.success++;
    } else {
      statusCount.other++;
    }
  });

  let allCount = statusCount.success + statusCount.other;
  let successRate = statusCount.success / allCount;

  let successPercent = Number(successRate * 100).toFixed(2) + "%";
  if (allCount === 0) {
    successPercent = "0%";
  }

  res.status(200).send({ data: successPercent });
}

export async function getTrackingOpenEmailCountRate(req, res) {
  const { userId } = req.body.member;
  // 拿到寄件者全部成功的寄信數量
  let userSuccessSentEmailCount;
  let openedEmailCount;

  userSuccessSentEmailCount = await getUserSuccessSentEmailCount(userId);

  //   拿到寄件者寄出信件的已開信數量
  openedEmailCount = await getOpenedEmailCount(userId);

  let allCount =
    openedEmailCount[0]["COUNT(*)"] + userSuccessSentEmailCount[0]["COUNT(*)"];
  let successRate = openedEmailCount[0]["COUNT(*)"] / allCount;

  let TrackingEmailCountRate = Number(successRate * 100).toFixed(2) + "%";
  if (allCount === 0) {
    TrackingEmailCountRate = "0%";
  }

  res.status(200).send({ data: TrackingEmailCountRate });
}

export async function getUserSentEmailQty(req, res) {
  const { userId } = req.body.member;
  let originalCount;

  originalCount = await getUserSentEmailCount(userId);

  // console.log(originalCount);
  let output = { count: originalCount[0]["COUNT(*)"] };
  res.status(200).send({ data: output });
}

export async function getUserSendEmailLog(req, res) {
  const { startTime, endTime } = req.body;
  const { userId } = req.body.member;
  let userSendEmailMessageWithoutAttachment =
    await getUserSendEmailMessageWithoutAttachment(userId, startTime, endTime);

  let userSendEmailWithAttachment = await getUserSendEmailWithAttachment(
    userId,
    startTime,
    endTime
  );

  let newArray = userSendEmailMessageWithoutAttachment.concat(
    userSendEmailWithAttachment
  );

  newArray.forEach((element) => {
    if (element.tracking_open === 1) {
      element.tracking_open = "yes";
    }
    if (element.tracking_open === 0) {
      element.tracking_open = "no";
    }
    if (element.tracking_click === 0) {
      element.tracking_click = "no";
    }
    if (element.tracking_click === 1) {
      element.tracking_click = "yes";
    }
    element.created_dt = `${turnTimeZone(element.created_dt)}`.slice(0, -4);
    if (element.original_name) {
      element.attachment = element.original_name;
      delete element.original_name;
    } else if (!element.original_name) {
      element.attachment = "undefined";
    }
  });
  // console.log(newArray);

  res.status(200).send({ data: newArray });
}

export async function getTrackingClickEmailInfo(req, res) {
  const { userId } = req.body.member;
  //用使用者id去撈使用者emailid，在用emailid去撈使用者的counrty,browser,platform
  let originalInfo = await getUserTrackingClickInformation(userId);

  let country = {};
  let browser = {};
  let platform = {};

  originalInfo.forEach((e) => {
    let originalCountry = e.recipient_country;
    let originalBrowser = e.recipient_browser;
    let originalPlatform = e.recipient_platform;
    if (country[originalCountry]) {
      country[originalCountry]++;
    } else {
      country[originalCountry] = 1;
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

export async function getSuccessDeliveryRate(req, res) {
  const { userId } = req.body.member;
  let eachStatus = await getUserEmailSendActionFromSNS(userId);
  let statusCount = { success: 0, other: 0 };
  eachStatus.forEach((e) => {
    let status = e.action;
    if (status === "success") {
      statusCount.success++;
    } else {
      statusCount.other++;
    }
  });
  let allCount = statusCount.success + statusCount.other;
  let successRate = statusCount.success / allCount;
  let successPercent = Number(successRate * 100).toFixed(2) + "%";
  if (allCount === 0) {
    successPercent = "0%";
  }
  res.status(200).send({ data: successPercent });
}
export async function getUserSendEmailBounceLog(req, res) {
  const { userId } = req.body.member;
  let log = await getUserSendEmailBounceMessage(userId);
  log.forEach((element) => {
    element.created_dt = `${turnTimeZone(element.created_dt)}`.slice(0, -4);
  });
  res.status(200).send({ data: log });
}
