let hahatoken = localStorage.getItem("userToken");
let userName = document.getElementById("user-name");
if (!hahatoken) {
  window.location.replace(`introduction.html`);
} else {
  let headers = { Authorization: `Bearer ${hahatoken}` };
  let getUserName = function () {
    fetch("/api/1.0/user/name", {
      method: "GET",
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
