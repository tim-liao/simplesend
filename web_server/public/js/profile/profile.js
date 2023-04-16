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
          API
          KEY ${i + 1} : ${originalData[i].api_key}
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
    email: "test",
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
