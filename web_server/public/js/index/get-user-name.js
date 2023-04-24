let hahatoken = localStorage.getItem("userToken");
let userName = document.getElementById("user-name");
if (!token) {
  window.location.replace(`sign_in.html`);
} else {
  let headers = { Authorization: `Bearer ${hahatoken}` };
  let getUserName = function () {
    fetch("/api/1.0/getusername", {
      method: "POST",
      headers: headers,
    })
      .then((response) => response.json())
      .then(function (json) {
        let name = json.data.userName;
        userName.innerHTML = name;
      });
  };
  getUserName();
}
