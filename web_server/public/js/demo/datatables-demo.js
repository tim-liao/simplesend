// Call the dataTables jQuery plugin
let userfailedemailmessage = document.getElementById("userfailedemailmessage");

let body = {
  userId: 1,
};
let headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
fetch("/api/1.0/getuserfailedemailmessage", {
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
              <th>Recipient Email</th>
              <th>Time</th>
              <th>Email Subject</th>
              <th>Error Status</th>
              <th>Error Log</th>
            </tr>
          </thead>
          <tfoot>
            <tr>
            <th>Recipient Email</th>
            <th>Time</th>
            <th>Email Subject</th>
            <th>Error Status</th>
            <th>Error Log</th>
            </tr>
          </tfoot>
          <tbody >`;
    allMessage.forEach((e) => {
      HTML += `
    <tr>
    <td>${e.recipient_email}</td>
    <td>${e.time}</td>
    <td>${e.email_subject}</td>
    <td>${e.error_status}</td>
    <td>${e.error_log}</td>
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
