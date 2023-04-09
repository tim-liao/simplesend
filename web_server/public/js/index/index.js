import { io } from "https://cdn.socket.io/4.6.1/socket.io.esm.min.js";
let trackingemailcountrate = document.getElementById("trackingemailcountrate");
let successrate = document.getElementById("successrate");
let successrateBar = document.getElementById("successrate-bar");
let trackingemailcountrateBar = document.getElementById(
  "trackingemailcountrate-bar"
);
let usersentemailcount = document.getElementById("usersentemailcount");
let body = {
  userId: 1,
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
      trackingemailcountrateBar.style = `width: ${json.data}`;
      trackingemailcountrate.innerHTML = `${json.data}`;
    });
};
emailcountrate();
fetch("/api/1.0/getsuccessrate", {
  method: "POST",
  headers: headers,
  body: JSON.stringify(body),
})
  .then((response) => response.json())
  .then(function (json) {
    successrateBar.style = `width: ${json.data}`;
    successrate.innerHTML = `${json.data}`;
  });
let sentemailcount = function () {
  fetch("/api/1.0/getusersentemailcount", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then(function (json) {
      usersentemailcount.innerHTML = `${json.data.count}件`;
    });
};
sentemailcount();
const socket = io("https://side-project2023.online");
socket.on(`hello`, (arg) => {
  console.log(arg);
});
// socket.emit("hello", "live client is connected");
socket.on(`updateDashboard`, (arg) => {
  if ((arg = "successfully send email")) {
    sentemailcount();
    emailcountrate();
  }
});
