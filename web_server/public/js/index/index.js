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

fetch("/api/1.0/getusersentemailcount", {
  method: "POST",
  headers: headers,
  body: JSON.stringify(body),
})
  .then((response) => response.json())
  .then(function (json) {
    usersentemailcount.innerHTML = `${json.data.count}件`;
  });
