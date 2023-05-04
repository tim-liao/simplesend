let userProfile = document.getElementById("userprofile");
let userAPiKey = document.getElementById("userapikey");
let userprofilebody = {
  userId: 1,
};
let token = localStorage.getItem("userToken");
if (!token) {
  window.location.replace(`introduction.html`);
}

let userprofileheaders = {
  Authorization: `Bearer ${token}`,
};
fetch("/api/1.0/getuserprofile", {
  method: "POST",
  headers: userprofileheaders,
  body: JSON.stringify(userprofilebody),
})
  .then((response) => response.json())
  .then(function (json) {
    if (json.status) {
      if (json.status == 403) {
        localStorage.removeItem("userToken");
        return window.location.replace(`introduction.html`);
      }
    }
    let originalData = json.data;
    userProfile.innerHTML = `   
    <span class="bg-secondary p-1 px-4 rounded text-white"
    >ID : ${originalData.id}</span
  >
  <h5 class="mt-2 mb-0">${originalData.name}</h5>
  <span>email : ${originalData.email}</span>

  `;
  });

let getnewestapikey = function () {
  fetch("/api/1.0/getnewestapikey", {
    method: "POST",
    headers: userprofileheaders,
  })
    .then((response) => response.json())
    .then(function (json) {
      fetch("/api/1.0/getAllActiveApiKeyWithExpiredTime", {
        method: "POST",
        headers: userprofileheaders,
        body: JSON.stringify(userprofilebody),
      })
        .then((response) => response.json())
        .then(function (json) {
          let originalData = json.data;
          userAPiKey.innerHTML = "";
          for (let i = 0; i < originalData.length; i++) {
            userAPiKey.innerHTML += ` 
          <div class="px-4 mt-1">
            <p class="fonts" id="apikey">
            <hr>
              API
              KEY ${i + 1}  ${originalData[i].api_key}
            </p>
            <p class="fonts" id="apikey">
              Expired Time : ${originalData[i].expired_time}
            
            </p>
          </div>
          `;
          }
        });
    });
};
getnewestapikey();
let generatenewapikeyButton = document.getElementById("generatenewapikey");
generatenewapikeyButton.addEventListener("click", function (e) {
  let aaheaders = {
    Authorization: `Bearer ${token}`,
  };

  fetch("/api/1.0/generatenewapikey", {
    method: "POST",
    headers: aaheaders,
  })
    .then((response) => response.json())
    .then(function (json) {
      if (json.status == 400) {
        document.getElementById("modal_title").innerHTML = "提醒";
        document.getElementById("modal_body").innerHTML = "客戶端出問題";
        $("#MyModal").modal("show");
      } else if (json.status == 500) {
        document.getElementById("modal_title").innerHTML = "系統問題";
        document.getElementById("modal_body").innerHTML = "請洽系統管理員";
        $("#MyModal").modal("show");
      } else {
        document.getElementById("apikey").innerHTML = `API
        KEY : ${json.data}`;
        document.getElementById("modal_title").innerHTML = "已生成新的 api key";
        document.getElementById("modal_body").innerHTML =
          "一次最多只有兩把有效的 api key ，一把有效期限為一年，較舊的另外一把為七天";
        $("#MyModal").modal("show");
        getnewestapikey();
      }
    });
});

let submitDomainName = document.getElementById("submitDomainName");
submitDomainName.addEventListener("click", () => {
  let newdomainName = document.getElementById("newdomainName").value;
  console.log(newdomainName);
  if (!newdomainName) {
    document.getElementById("modal_title").innerHTML = "錯誤";
    document.getElementById("modal_body").innerHTML = "請打入你想要提交的域名";
    $("#MyModal").modal("show");
  } else {
    let bbheaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
    fetch("/api/1.0/userGetStringToStoreInDnsSetting", {
      method: "POST",
      headers: bbheaders,
      body: JSON.stringify({ domainName: newdomainName }),
    })
      .then((response) => response.json())
      .then(function (json) {
        console.log(json);
        let originalData = json.data;
        if (originalData) {
          document.getElementById("modal_title").innerHTML =
            "記得去DNS那邊設定TXT";
          document.getElementById(
            "modal_body"
          ).innerHTML = ` <img src="img/example.png" style="width:28vw" /><p>string : ${originalData.verifyString}</p>`;
          $("#MyModal").modal("show");
          getAllDomainNameInfo();
        } else {
          if (json.status == 400) {
            document.getElementById("modal_title").innerHTML = "錯誤";
            document.getElementById(
              "modal_body"
            ).innerHTML = `錯誤訊息 : ${json.message}`;
            $("#MyModal").modal("show");
          } else {
            document.getElementById("modal_title").innerHTML = "錯誤";
            document.getElementById("modal_body").innerHTML = "系統問題";
            $("#MyModal").modal("show");
          }
        }
      });
  }
});
const forFun = function () {
  document.getElementById("modal_title").innerHTML = "您尚無登記任何域名...";
  document.getElementById("modal_body").innerHTML =
    "請於上方欄位鍵入您可使用的域名來進行認證登記，認證完畢後方可進行寄件";
  $("#MyModal").modal("show");
};
let allDomainName = document.getElementById("allDomainName");
let getAllDomainNameInfo = function () {
  fetch("/api/1.0/getAllUserDomainNameINfor", {
    method: "POST",
    headers: userprofileheaders,
  })
    .then((response) => response.json())
    .then(function (json) {
      let originalData = json.data;
      if (json.message == "you donot have submitted domain name") {
        allDomainName.innerHTML += `<div class="input-group mb-3">
      <input
        type="text"
        class="form-control"
        value="you donot have submitted domain name... "
        disabled="disabled"
      />
      <div class="input-group-append">
        <button
          class="btn btn-outline-primary px-4"
          type="button"
          onClick="forFun()"
        >
          CLICK
        </button>
      </div>
      
    </div>`;
      }
      if (originalData) {
        allDomainName.innerHTML = `<div class="input-group mb-3">
        <input type="text" class="form-control text-center" style="flex-basis: 180px;" value="DOMAIN NAME" disabled="disabled" />
        <input type="text" class="form-control text-center" style="flex-basis: 180px;" value="STATUS" disabled="disabled" />
        <input type="text" class="form-control text-center" style="flex-basis: 180px;" value="SETTING STRING" disabled="disabled" />
        <input type="text" class="form-control text-center" style="width: 330px;" value="ACTION" disabled="disabled" />
      </div>
      
      
      `;
        for (let i = 0; i < originalData.length; i++) {
          console.log(i);
          allDomainName.innerHTML += `<div class="input-group mb-3">
      <input
        type="text"
        class="form-control col-3  text-center"
        value="${originalData[i].domain_name}"
        disabled="disabled"
      />
    <input
      type="text"
      class="form-control col-3  text-center"
      value="${originalData[i].verify_status}"
      disabled="disabled"
    />
    <input
    type="text"
    class="form-control col-3 "
    value="${originalData[i].setting_string}"
    disabled="disabled"
  />
  
      <div class="input-group-append">
      <button
      class="btn btn-outline-primary px-4"
      type="button"
      onClick="copySettingString('${originalData[i].setting_string}')"
    >
      COPY STRING
    </button>
    </div>
      <div class="input-group-append">
        <button
          class="btn btn-outline-primary px-4"
          type="button"
          onClick="submitVerifyDomainName('${originalData[i].domain_name}')"
        >
          VERIFY
        </button>
      </div>
      <div class="input-group-append">
        <button
          class="btn btn-outline-primary px-4"
          type="button"
          onClick="submitDeleteDomainName('${originalData[i].domain_name}')"
        >
          DELETE
        </button>
      </div>
 
    </div>`;
        }
      } else {
      }
    });
};
getAllDomainNameInfo();
let submitVerifyDomainName = function (domainName) {
  let bbheaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
  fetch("/api/1.0/verifyUserDomainName", {
    method: "POST",
    headers: bbheaders,
    body: JSON.stringify({ domainName: domainName }),
  })
    .then((response) => response.json())
    .then(function (json) {
      let originalData = json.data;
      // console.log(originalData);
      document.getElementById("modal_title").innerHTML = "驗證狀況";
      document.getElementById(
        "modal_body"
      ).innerHTML = `string : ${originalData.verifyStatus}`;
      $("#MyModal").modal("show");
      getAllDomainNameInfo();
    });
};
let submitDeleteDomainName = function (domainName) {
  let bbheaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
  fetch("/api/1.0/deleteUserDomainName", {
    method: "POST",
    headers: bbheaders,
    body: JSON.stringify({ domainName: domainName }),
  })
    .then((response) => response.json())
    .then(function (json) {
      let originalData = json.data;
      if (originalData == "successfully deleted") {
        document.getElementById("modal_title").innerHTML = "刪除了";
        document.getElementById("modal_body").innerHTML = `已進行刪除`;
        $("#MyModal").modal("show");
        getAllDomainNameInfo();
      } else {
        document.getElementById("modal_title").innerHTML =
          "在刪除時出了點問題..";
        document.getElementById("modal_body").innerHTML = `請洽系統管理員`;
        $("#MyModal").modal("show");
      }
    });
};
let copySettingString = function (string) {
  navigator.clipboard.writeText(string);
  document.getElementById("modal_title").innerHTML = "已複製";
  document.getElementById("modal_body").innerHTML = `${string}`;
  $("#MyModal").modal("show");
};
let notForUse = function () {
  document.getElementById("modal_title").innerHTML = "提示";
  document.getElementById("modal_body").innerHTML = `此為無效按鈕`;
  $("#MyModal").modal("show");
};
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("userToken");

  return window.location.replace(`introduction.html`);
});
