// Set new default font family and font color to mimic Bootstrap's default styling
(Chart.defaults.global.defaultFontFamily = "Nunito"),
  '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = "#858796";

function number_format(number, decimals, dec_point, thousands_sep) {
  // *     example: number_format(1234.56, 2, ',', ' ');
  // *     return: '1 234,56'
  number = (number + "").replace(",", "").replace(" ", "");
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = typeof thousands_sep === "undefined" ? "," : thousands_sep,
    dec = typeof dec_point === "undefined" ? "." : dec_point,
    s = "",
    toFixedFix = function (n, prec) {
      var k = Math.pow(10, prec);
      return "" + Math.round(n * k) / k;
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || "").length < prec) {
    s[1] = s[1] || "";
    s[1] += new Array(prec - s[1].length + 1).join("0");
  }
  return s.join(dec);
}

/////////目前寫死，但要想方法讓使用者在前端可以做選擇要選擇哪個時段的
// TODO:這邊之後會需要拿取前端儲存的使用者access token放到header裡面然後丟給後端判斷是誰
const emailHistoryLineChart = function (labelsArray, dataArray) {
  document.getElementById("chart-area").innerHTML =
    '<canvas id="myAreaChart"></canvas>';
  let ctx = document.getElementById("myAreaChart");
  let myLineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labelsArray,
      datasets: [
        {
          label: "寄件數量",
          lineTension: 0.3,
          backgroundColor: "rgba(78, 115, 223, 0.05)",
          borderColor: "rgba(78, 115, 223, 1)",
          pointRadius: 3,
          pointBackgroundColor: "rgba(78, 115, 223, 1)",
          pointBorderColor: "rgba(78, 115, 223, 1)",
          pointHoverRadius: 3,
          pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
          pointHoverBorderColor: "rgba(78, 115, 223, 1)",
          pointHitRadius: 10,
          pointBorderWidth: 2,
          data: dataArray,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0,
        },
      },
      scales: {
        xAxes: [
          {
            time: {
              unit: "date",
            },
            gridLines: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              maxTicksLimit: 7,
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              maxTicksLimit: 5,
              padding: 10,
              // Include a dollar sign in the ticks
              callback: function (value, index, values) {
                return number_format(value) + "件";
              },
            },
            gridLines: {
              color: "rgb(234, 236, 244)",
              zeroLineColor: "rgb(234, 236, 244)",
              drawBorder: false,
              borderDash: [2],
              zeroLineBorderDash: [2],
            },
          },
        ],
      },
      legend: {
        display: false,
      },
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        titleMarginBottom: 10,
        titleFontColor: "#6e707e",
        titleFontSize: 14,
        borderColor: "#dddfeb",
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        intersect: false,
        mode: "index",
        caretPadding: 10,
        callbacks: {
          label: function (tooltipItem, chart) {
            var datasetLabel =
              chart.datasets[tooltipItem.datasetIndex].label || "";
            return (
              datasetLabel + ": " + number_format(tooltipItem.yLabel) + "件"
            );
          },
        },
      },
    },
  });
};
let token = localStorage.getItem("userToken");
let aaheaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
};

const form = document.getElementById("form");
form.addEventListener("submit", submitForm);
function submitForm(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  formData.forEach((val, key) => {
    formData[key] = val;
  });
  // console.log(formData);

  if (formData.startTime > formData.endTime) {
    $("#MyModal").modal("show");
  } else {
    formData.forEach((val, key) => {
      const parts = val.split("/");
      const year = parts[2];
      const month = parts[0].padStart(2, "0");
      const day = parts[1].padStart(2, "0");
      const convertedDate = `${year}-${month}-${day}`;
      formData[key] = convertedDate;
    });
    let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    formData["tz"] = tz;
    console.log(formData);
    let body = {
      tz: formData.tz,
      startTime: formData.startTime,
      endTime: formData.endTime,
    };

    fetch("/api/1.0/getemailhistory", {
      method: "POST",
      headers: aaheaders,
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then(function (json) {
        // console.log(json);
        let labelsArray = Object.keys(json.data);
        let dataArray = Object.values(json.data);
        // console.log(labelsArray, dataArray);
        emailHistoryLineChart(labelsArray, dataArray);
      });
  }
}

// const paramsId = new URLSearchParams(document.location.search);
// const id = paramsId.get("id");
let chartBody = {
  tz: "Asia/Taipei",
  startTime: "2023-04-12",
  endTime: "2023-04-19",
};
let chartHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${token}`,
};
fetch("/api/1.0/getemailhistory", {
  method: "POST",
  headers: aaheaders,
  body: JSON.stringify(chartBody),
})
  .then((response) => response.json())
  .then(function (json) {
    // console.log(json);
    let labelsArray = Object.keys(json.data);
    let dataArray = Object.values(json.data);
    // console.log(labelsArray, dataArray);
    emailHistoryLineChart(labelsArray, dataArray);
  });
