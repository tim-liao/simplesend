// Call the dataTables jQuery plugin
let token = localStorage.getItem("userToken");
if (!token) {
  window.location.replace(`introduction.html`);
}
let userfailedemailmessage = document.getElementById("userfailedemailmessage");

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const sevenDaysAgo = new Date(today);
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};
let chartBody = {
  tz: "Asia/Taipei",
  startTime: formatDate(sevenDaysAgo),
  endTime: formatDate(tomorrow),
};

const aa = function (body) {
  let headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
  fetch("/api/1.0/dashboard/emails", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then(function (json) {
      let allMessage = json.data;
      if (json.status) {
        if (json.status == 403) {
          localStorage.removeItem("userToken");
          return window.location.replace(`introduction.html`);
        }
      }
      if (allMessage.length == 0) {
        document.getElementById("modal_title").innerHTML = "無資訊顯示";
        document.getElementById("modal_body").innerHTML =
          "此時間區間無任何紀錄";
        $("#MyModal").modal("show");
      }
      let HTML = `<div class="card shadow mb-4">
    <div class="card-header py-3">
      <h6 class="m-0 font-weight-bold text-primary">
    
      </h6>
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table
          class="table table-bordered"
          id="dataTable"
          width="100%"
          cellspacing="0"
        >
          <thead>
            <tr>
            <th>寄件名稱</th>
            <th>主要收件人</th>
            <th>密件副本收件人</th>
            <th>副本收件人</th>
            <th>信件回覆地址</th>
            <th>信件標題</th>
            <th>信件格式</th>
            <th>信件追蹤</th>
            <th>連結追蹤</th>
            <th>寄件狀態</th>
            <th>詳細訊息</th>
            <th>生成時間</th>
            <th>追蹤連結</th>
            <th>附件檔名</th>
            </tr>
          </thead>
          <tfoot>
            <tr>
            <th>Name_From</th>
            <th>Email_To</th>
            <th>Email_Bcc</th>
            <th>Email_Cc</th>
            <th>Email_Reply_To</th>
            <th>Email_Subject</th>
            <th>Email_Body_Type</th>
            <th>Tracking_Open</th>
            <th>Tracking_Click</th>
            <th>Send_Status</th>
            <th>Send_Message</th>
            <th>Created_Time</th>
            <th>Tracking_Link</th>
            <th>Attachment</th>
            </tr>
          </tfoot>
          <tbody >`;
      allMessage.forEach((e) => {
        HTML += `
    <tr>
    <td>${e.name_from}</td>
    <td>${e.email_to}</td>
    <td>${e.email_bcc}</td>
    <td>${e.email_cc}</td>
    <td>${e.email_reply_to}</td>
    <td>${e.email_subject}</td>
    <td>${e.email_body_type}</td>
    <td>${e.tracking_open}</td>
    <td>${e.tracking_click}</td>
    <td>${e.send_status}</td>
    <td>${e.send_message}</td>
    <td>${e.created_dt}</td>
    <td>${e.tracking_link}</td>
    <td>${e.attachment}</td>
  </tr>`;
      });
      HTML += `</tbody>
    </table>
  </div>
</div>
</div>`;
      userfailedemailmessage.innerHTML = HTML;
      $(document).ready(function () {
        $("#dataTable").DataTable();
      });
    });
};
aa(chartBody);
const form = document.getElementById("form");
form.addEventListener("submit", submitForm);
function submitForm(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  formData.forEach((val, key) => {
    formData[key] = val;
  });
  if (formData.startTime > formData.endTime) {
    document.getElementById("modal_title").innerHTML = "提醒";
    document.getElementById("modal_body").innerHTML = `起始日期須小於結束日期`;
    $("#MyModal").modal("show");
  } else {
    formData.forEach((val, key) => {
      // const parts = val.split("/");
      // const year = parts[2];
      // const month = parts[0].padStart(2, "0");
      // const day = parts[1].padStart(2, "0");
      // const convertedDate = `${year}-${month}-${day}`;
      // formData[key] = convertedDate;
    });
    let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    formData["tz"] = tz;
    // console.log(formData);
    let body = {
      tz: formData.tz,
      startTime: formData.startTime,
      endTime: formData.endTime,
    };
    console.log(body);
    aa(body);
  }
}
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("userToken");

  return window.location.replace(`introduction.html`);
});
