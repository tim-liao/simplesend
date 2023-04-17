let userProfile = document.getElementById("userprofile");
let userAPiKey = document.getElementById("userapikey");
let userprofilebody = {
  userId: 1,
};
let userprofileheaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
fetch("/api/1.0/getuserprofile", {
  method: "POST",
  headers: userprofileheaders,
  body: JSON.stringify(userprofilebody),
})
  .then((response) => response.json())
  .then(function (json) {
    let originalData = json.data;
    userProfile.innerHTML = `   
    <span class="bg-secondary p-1 px-4 rounded text-white"
    >ID : ${originalData.id}</span
  >
  <h5 class="mt-2 mb-0">${originalData.name}</h5>
  <span>email : ${originalData.email}</span>

  `;
  });
fetch("/api/1.0/getAllActiveApiKeyWithExpiredTime", {
  method: "POST",
  headers: userprofileheaders,
  body: JSON.stringify(userprofilebody),
})
  .then((response) => response.json())
  .then(function (json) {
    let originalData = json.data;
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

let generatenewapikeyButton = document.getElementById("generatenewapikey");
generatenewapikeyButton.addEventListener("click", function (e) {
  let generatenewapikeybody = {
    userId: 1,
  };
  let generatenewapikeyheaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  fetch("/api/1.0/generatenewapikey", {
    method: "POST",
    headers: generatenewapikeyheaders,
    body: JSON.stringify(generatenewapikeybody),
  })
    .then((response) => response.json())
    .then(function (json) {
      //   console.log(json);

      if (json.status == 400) {
        document.getElementById("modal_title").innerHTML = "提醒";
        document.getElementById("modal_body").innerHTML =
          "七天內只能生成一次喔";
        $("#MyModal").modal("show");
      } else if (json.status == 500) {
        document.getElementById("modal_title").innerHTML = "系統問題";
        document.getElementById("modal_body").innerHTML = "請洽系統管理員";
        $("#MyModal").modal("show");
      } else {
        document.getElementById("apikey").innerHTML = `API
        KEY : ${json.data}`;
        document.getElementById("modal_title").innerHTML = "已生成";
        document.getElementById("modal_body").innerHTML =
          "舊的key還可以有七天的使用期限，七天內只有一次的換key機會";
        $("#MyModal").modal("show");
      }
    });
});

let submitDomainName = document.getElementById("submitDomainName");
submitDomainName.addEventListener("click", () => {
  let newdomainName = document.getElementById("newdomainName").value;
  if (!newdomainName) {
    document.getElementById("modal_title").innerHTML = "錯誤";
    document.getElementById("modal_body").innerHTML =
      "請打入你想要提交的domain name";
    $("#MyModal").modal("show");
  } else {
    fetch("/api/1.0/userGetStringToStoreInDnsSetting", {
      method: "POST",
      headers: userprofileheaders,
      body: JSON.stringify({ userId: 1, domainName: newdomainName }),
    })
      .then((response) => response.json())
      .then(function (json) {
        let originalData = json.data;
        document.getElementById("modal_title").innerHTML =
          "記得去DNS那邊設定TXT";
        document.getElementById(
          "modal_body"
        ).innerHTML = `string : ${originalData.verifyString}`;
        $("#MyModal").modal("show");
      });
  }
});

let allDomainName = document.getElementById("allDomainName");
fetch("/api/1.0/getAllUserDomainNameINfor", {
  method: "POST",
  headers: userprofileheaders,
  body: JSON.stringify({ userId: 1 }),
})
  .then((response) => response.json())
  .then(function (json) {
    let originalData = json.data;
    for (let i = 0; i < originalData.length; i++) {
      allDomainName.innerHTML += `<div class="input-group mb-3">
      <input
        type="text"
        class="form-control"
        value="domain name :${originalData[i].domain_name} | string : ${originalData[i].setting_string} | status : ${originalData[i].verify_status}"
        disabled="disabled"
      />
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
  });
let submitVerifyDomainName = function (domainName) {
  fetch("/api/1.0/verifyUserDomainName", {
    method: "POST",
    headers: userprofileheaders,
    body: JSON.stringify({ userId: 1, domainName: domainName }),
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
    });
};
let submitDeleteDomainName = function (domainName) {
  fetch("/api/1.0/deleteUserDomainName", {
    method: "POST",
    headers: userprofileheaders,
    body: JSON.stringify({ userId: 1, domainName: domainName }),
  })
    .then((response) => response.json())
    .then(function (json) {
      let originalData = json.data;
      if (originalData == "successfully deleted") {
        document.getElementById("modal_title").innerHTML = "刪除了";
        document.getElementById("modal_body").innerHTML = `已進行刪除`;
        $("#MyModal").modal("show");
      } else {
        document.getElementById("modal_title").innerHTML =
          "在刪除時出了點問題..";
        document.getElementById("modal_body").innerHTML = `請洽系統管理員`;
        $("#MyModal").modal("show");
      }
    });
};
