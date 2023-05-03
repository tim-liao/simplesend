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
  fetch("/api/1.0/getUserSendEmailMessage", {
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
        let aa = ["登愣...", "空空的...", "意不意外？驚不驚喜？", "怎麼會..."];
        function getRandomInt(max) {
          return Math.floor(Math.random() * max);
        }
        let bb = getRandomInt(4);
        document.getElementById("modal_title").innerHTML = aa[bb];
        document.getElementById("modal_body").innerHTML =
          "這個時間區間都沒有紀錄喔...";
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
            <th>name_from</th>
            <th>email_to</th>
            <th>email_bcc</th>
            <th>email_cc</th>
            <th>email_reply_to</th>
            <th>email_subject</th>
            <th>email_body_type</th>
            <th>tracking_open</th>
            <th>tracking_click</th>
            <th>send_status</th>
            <th>send_message</th>
            <th>created_dt</th>
            <th>tracking_link</th>
            <th>attachment</th>
            </tr>
          </thead>
          <tfoot>
            <tr>
            <th>name_from</th>
            <th>email_to</th>
            <th>email_bcc</th>
            <th>email_cc</th>
            <th>email_reply_to</th>
            <th>email_subject</th>
            <th>email_body_type</th>
            <th>tracking_open</th>
            <th>tracking_click</th>
            <th>send_status</th>
            <th>send_message</th>
            <th>created_dt</th>
            <th>tracking_link</th>
            <th>attachment</th>
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
    aa(body);
  }
}
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("userToken");

  return window.location.replace(`introduction.html`);
});
