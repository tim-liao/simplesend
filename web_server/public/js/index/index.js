import { io } from "https://cdn.socket.io/4.6.1/socket.io.esm.min.js";
let trackingemailcountrate = document.getElementById("trackingemailcountrate");
let successrate = document.getElementById("successrate");
let successrateBar = document.getElementById("successrate-bar");
let ssuccessdelivery = document.getElementById("successdelivery");
let successdeliveryBar = document.getElementById("successdelivery-bar");
let trackingemailcountrateBar = document.getElementById(
  "trackingemailcountrate-bar"
);

let token = localStorage.getItem("userToken");
if (!token) {
  window.location.replace(`sign_in.html`);
} else {
  let usersentemailcount = document.getElementById("usersentemailcount");

  let headers = { Authorization: `Bearer ${token}` };
  // console.log(headers);
  let emailcountrate = function () {
    fetch("/api/1.0/gettrackingopenemailcountrate", {
      method: "POST",
      headers,
    })
      .then((response) => response.json())
      .then(function (json) {
        if (json.status) {
          if (json.status == 403) {
            localStorage.removeItem("userToken");
            return window.location.replace(`sign_in.html`);
          }
        }
        trackingemailcountrateBar.style = `width: ${json.data}`;
        trackingemailcountrate.innerHTML = `${json.data}`;
      });
  };
  emailcountrate();
  let successratefunction = function () {
    fetch("/api/1.0/getsuccessrate", {
      method: "POST",
      headers: headers,
    })
      .then((response) => response.json())
      .then(function (json) {
        // console.log(json);
        successrateBar.style = `width: ${json.data}`;
        successrate.innerHTML = `${json.data}`;
      });
  };
  successratefunction();

  let successdeliveryratefunction = function () {
    fetch("/api/1.0/getsuccessdeliveryrate", {
      method: "POST",
      headers: headers,
    })
      .then((response) => response.json())
      .then(function (json) {
        // console.log(json);
        successdeliveryBar.style = `width: ${json.data}`;
        successdelivery.innerHTML = `${json.data}`;
      });
  };
  successdeliveryratefunction();

  let sentemailcount = function () {
    fetch("/api/1.0/getusersentemailcount", {
      method: "POST",
      headers: headers,
    })
      .then((response) => response.json())
      .then(function (json) {
        // console.log(json);
        usersentemailcount.innerHTML = `${json.data.count}件`;
      });
  };
  sentemailcount();
  // const socket = io("https://side-project2023.online");
  const socket = io("ws://localhost:3030"); // 我的電腦
  socket.on(`toclient`, (arg) => {
    console.log(arg);
  });
  socket.emit("toserver", `${1}`);
  // socket.emit("hello", "live client is connected");
  socket.on(`updateDashboard`, (arg) => {
    if ((arg = "successfully send email")) {
      sentemailcount();
      emailcountrate();
      successratefunction();
    }
  });
}
