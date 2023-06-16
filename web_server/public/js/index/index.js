let trackingemailcountrate = document.getElementById("trackingemailcountrate");
let successrate = document.getElementById("successrate");
let successrateBar = document.getElementById("successrate-bar");
let successdelivery = document.getElementById("successdelivery");
let successdeliveryBar = document.getElementById("successdelivery-bar");
let trackingemailcountrateBar = document.getElementById(
  "trackingemailcountrate-bar"
);

let token = localStorage.getItem("userToken");
if (!token) {
  window.location.replace(`introduction.html`);
} else {
  let usersentemailcount = document.getElementById("usersentemailcount");

  let headers = { Authorization: `Bearer ${token}` };
  // console.log(headers);
  let emailcountrate = function () {
    fetch("/api/1.0/dashboard/emails/tracking/openingrate", {
      method: "GET",
      headers,
    })
      .then((response) => response.json())
      .then(function (json) {
        if (json.status) {
          if (json.status == 403) {
            localStorage.removeItem("userToken");
            return window.location.replace(`introduction.html`);
          }
        }
        trackingemailcountrateBar.style = `width: ${json.data}`;
        trackingemailcountrate.innerHTML = `${json.data}`;
      });
  };
  emailcountrate();
  let successratefunction = function () {
    fetch("/api/1.0/dashboard/emails/sendingrate", {
      method: "GET",
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
    fetch("/api/1.0/dashboard/emails/deliveredrate", {
      method: "GET",
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
    fetch("/api/1.0/dashboard/emails/count", {
      method: "GET",
      headers: headers,
    })
      .then((response) => response.json())
      .then(function (json) {
        usersentemailcount.innerHTML = `${json.data.count}件`;
      });
  };
  sentemailcount();
}
