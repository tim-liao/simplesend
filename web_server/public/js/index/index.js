import { io } from "https://cdn.socket.io/4.6.1/socket.io.esm.min.js";
let trackingemailcountrate = document.getElementById("trackingemailcountrate");
let successrate = document.getElementById("successrate");
let successrateBar = document.getElementById("successrate-bar");
let trackingemailcountrateBar = document.getElementById(
  "trackingemailcountrate-bar"
);

const paramsId = new URLSearchParams(document.location.search);
const userId = paramsId.get("id");
if (!userId) {
  // console.log(123);
  window.location.replace(`login.html`);
}
// console.log(id);
let usersentemailcount = document.getElementById("usersentemailcount");
let body = {
  userId: userId,
};
let headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
let emailcountrate = function () {
  fetch("/api/1.0/gettrackingemailcountrate", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then(function (json) {
      console.log(json);
      trackingemailcountrateBar.style = `width: ${json.data}`;
      trackingemailcountrate.innerHTML = `${json.data}`;
    });
};
emailcountrate();
let successratefunction = function () {
  fetch("/api/1.0/getsuccessrate", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then(function (json) {
      console.log(json);
      successrateBar.style = `width: ${json.data}`;
      successrate.innerHTML = `${json.data}`;
    });
};
successratefunction();
let sentemailcount = function () {
  fetch("/api/1.0/getusersentemailcount", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then(function (json) {
      console.log(json);
      usersentemailcount.innerHTML = `${json.data.count}件`;
    });
};
sentemailcount();
const socket = io("https://side-project2023.online");
// const socket = io("ws://localhost:3030"); // 我的電腦
socket.on(`toclient`, (arg) => {
  console.log(arg);
});
socket.emit("toserver", `${userId}`);
// socket.emit("hello", "live client is connected");
socket.on(`updateDashboard`, (arg) => {
  if ((arg = "successfully send email")) {
    sentemailcount();
    emailcountrate();
    successratefunction();
  }
});
