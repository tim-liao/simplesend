// Call the dataTables jQuery plugin
let token = localStorage.getItem("userToken");
if (!token) {
  window.location.replace(`sign_in.html`);
}
let userfailedemailmessage = document.getElementById("userfailedemailmessage");

let body = {
  userId: 1,
};
let headers = { Authorization: `Bearer ${token}` };
fetch("/api/1.0/getUserSendEmailMessage", {
  method: "POST",
  headers: headers,
})
  .then((response) => response.json())
  .then(function (json) {
    let allMessage = json.data;
    if (json.status) {
      if (json.status == 403) {
        localStorage.removeItem("userToken");
        return window.location.replace(`sign_in.html`);
      }
    }
    if (allMessage.length == 0) {
      let aa = ["登愣...", "空空的很正常喔...", "意不意外？驚不驚喜？"];
      function getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }
      let bb = getRandomInt(3);
      document.getElementById("modal_title").innerHTML = aa[bb];
      document.getElementById("modal_body").innerHTML =
        "你還沒有任何email 的訊息，因為你還沒有寄出任何郵件過...";
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
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("userToken");

  return window.location.replace(`sign_in.html`);
});
