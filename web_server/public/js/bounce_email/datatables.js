// Call the dataTables jQuery plugin
let token = localStorage.getItem("userToken");
if (!token) {
  window.location.replace(`introduction.html`);
}
let userfailedemailmessage = document.getElementById("userfailedemailmessage");

let headers = { Authorization: `Bearer ${token}` };
fetch("/api/1.0/dashboard/bounce", {
  method: "GET",
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
      document.getElementById("modal_title").innerHTML = "無任何資訊顯示";
      document.getElementById("modal_body").innerHTML = "尚無任何資訊可供顯示";
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
            <th>失敗郵件地址</th>
            <th>失敗詳細狀態</th>
            <th>失敗詳細訊息</th>
            <th>資訊生成時間</th>
            </tr>
          </thead>
          <tfoot>
            <tr>
            <th>Email_Address</th>
            <th>Action</th>
            <th>Action_Message</th>
            <th>Created_Time</th>
            </tr>
          </tfoot>
          <tbody >`;
    allMessage.forEach((e) => {
      HTML += `
    <tr>
    <td>${e.email_address}</td>
    <td>${e.action}</td>
    <td>${e.action_message}</td>
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
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("userToken");

  return window.location.replace(`introduction.html`);
});
