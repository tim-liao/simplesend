// Call the dataTables jQuery plugin
let userfailedemailmessage = document.getElementById("userfailedemailmessage");

let body = {
  userId: 1,
};
let headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
fetch("/api/1.0/getUserSendEmailMessage", {
  method: "POST",
  headers: headers,
  body: JSON.stringify(body),
})
  .then((response) => response.json())
  .then(function (json) {
    let allMessage = json.data;
    let HTML = `<div class="card shadow mb-4">
    <div class="card-header py-3">
      <h6 class="m-0 font-weight-bold text-primary">
      ERROR SENT
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
