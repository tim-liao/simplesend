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
      document.getElementById("modal_title").innerHTML = "註冊失敗";
      document.getElementById("modal_body").innerHTML = `請輸入完整欄位再提交`;
      $("#MyModal").modal("show");
      break;
    }
  }
  if (checkValueISOkOrNot == true) {
    if (formData.password != formData.repeatPassword) {
      checkValueISOkOrNot = false;
      document.getElementById("modal_title").innerHTML = "密碼請確認";
      document.getElementById(
        "modal_body"
      ).innerHTML = `兩次密碼不同，請仔細輸入密碼`;
      $("#MyModal").modal("show");
    }
    let email = formData.email;
    if (checkValueISOkOrNot == true && email.length > 100) {
      checkValueISOkOrNot = false;
      document.getElementById("modal_title").innerHTML = "email不符規格";
      document.getElementById("modal_body").innerHTML = `email太長`;
      $("#MyModal").modal("show");
    }
    if (checkValueISOkOrNot == true) {
      function isValidEmail(email) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
      }
      let legalEmailOrNot = isValidEmail(email);
      if (legalEmailOrNot == false) {
        document.getElementById("modal_title").innerHTML = "email不符規格";
        document.getElementById(
          "modal_body"
        ).innerHTML = `email須包含「＠」以及域名`;
        $("#MyModal").modal("show");
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
        name: formData.name,
      };
      fetch("/api/1.0/user/signup", {
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
            document.getElementById("modal_title").innerHTML = "註冊成功";
            document.getElementById(
              "modal_body"
            ).innerHTML = `即將跳轉到首頁...`;
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
  }
});
