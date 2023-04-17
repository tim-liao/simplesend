let token = localStorage.getItem("userToken");
if (token) {
  window.location.replace(`index.html`);
}
const transformData = (element) => {
  let x = new FormData(element.target);
  x.forEach((val, key) => {
    x[key] = val;
  });
  return x;
};
document.getElementById("user").addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = transformData(e);
  let valuesArray = Object.values(formData);
  let checkValueISOkOrNot = true;
  for (const i in valuesArray) {
    if (valuesArray[i] == false) {
      checkValueISOkOrNot = false;
      document.getElementById("modal_title").innerHTML = "登入失敗";
      document.getElementById("modal_body").innerHTML = `請輸入完整欄位再提交`;
      $("#MyModal").modal("show");
      break;
    }
  }
  if (checkValueISOkOrNot == true) {
    let email = formData.email;
    if (checkValueISOkOrNot == true && email.length > 100) {
      checkValueISOkOrNot = false;
      document.getElementById("modal_title").innerHTML = "email不符規格";
      document.getElementById("modal_body").innerHTML = `email太長`;
      $("#MyModal").modal("show");
    }
    let checkDotCom = "";
    for (let i = email.length - 1; i > email.length - 5; i--) {
      checkDotCom = email[i] + checkDotCom;
    }
    if (checkValueISOkOrNot == true && checkDotCom != ".com") {
      checkValueISOkOrNot = false;
      document.getElementById("modal_title").innerHTML = "email不符規格";
      document.getElementById("modal_body").innerHTML = `email沒有.com`;
      $("#MyModal").modal("show");
    }
    if (checkValueISOkOrNot == true) {
      for (let i = 0; i < email.length; i++) {
        if (email[i] == "@") {
          break;
        } else if (i == email.length - 1 && email[i] != "@") {
          checkValueISOkOrNot = false;
          document.getElementById("modal_title").innerHTML = "email不符規格";
          document.getElementById("modal_body").innerHTML = `email沒有@`;
          $("#MyModal").modal("show");
        }
      }
    }
  }
  if (checkValueISOkOrNot == true) {
    // 可以fetch了
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    let body = {
      email: formData.email,
      password: formData.password,
    };
    fetch("/api/1.0/userSignIn", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then(function (json) {
        if (json.data) {
          let { data } = json;
          let accessToken;
          accessToken = data.access_token;
          localStorage.setItem("userToken", accessToken);
          document.getElementById("modal_title").innerHTML = "登入成功";
          document.getElementById("modal_body").innerHTML = `即將跳轉到首頁...`;
          $("#MyModal").modal("show");
          window.location.replace(`index.html`);
        } else if (json.status) {
          if (json.status == 400) {
            document.getElementById("modal_title").innerHTML = "輸入有誤";
            document.getElementById(
              "modal_body"
            ).innerHTML = `錯誤訊息 : ${json.message}`;
            $("#MyModal").modal("show");
          } else if (json.status == 500) {
            document.getElementById("modal_title").innerHTML = "系統問題";
            document.getElementById(
              "modal_body"
            ).innerHTML = ` 請通知系統管理員`;
            $("#MyModal").modal("show");
          }
        }
      });
  }
});
