// Set new default font family and font color to mimic Bootstrap's default styling
(Chart.defaults.global.defaultFontFamily = "Nunito"),
  '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = "#858796";

// Pie Chart Example
const countryChart = document.getElementById("countryPieChart");
const browserChart = document.getElementById("browserPieChart");
const platformChart = document.getElementById("platformPieChart");

let userToken = localStorage.getItem("userToken");
if (!userToken) {
  window.location.replace(`introduction.html`);
}

let userHeaders = { Authorization: `Bearer ${userToken}` };

let gettrackingclickemailinfor = function () {
  fetch("/api/1.0/gettrackingclickemailinfor", {
    method: "POST",
    headers: userHeaders,
  })
    .then((response) => response.json())
    .then(function (json) {
      const { country, browser, platform } = json.data;
      let a = makeChart(country, countryChart);
      let b = makeChart(browser, browserChart);
      let c = makeChart(platform, platformChart);
    });
};

let colorArray = [
  "#E0A869",
  "#298B4A",
  "#006666",
  "#9B7B04",
  "#A0522D",
  "#31698A",
  "#FF69B4",
  "#4C787E",
  "#CD853F",
  "#D4AF37",
  "#F3722C",
  "#A8DADC",
  "#457B9D",
  "#1D3557",
  "#03071E",
  "#370617",
  "#6A040F",
  "#9D0208",
  "#D00000",
  "#DC2F02",
  "#E85D04",
  "#B8860B",
  "#CD853F",
  "#FFA07A",
  "#FCEADE",
  "#F8F3F1",
  "#F5E1D4",
  "#ECD5E3",
  "#E8AEB7",
  "#B2B1CF",
  "#D6D5E3",
  "#E5E5E5",
  "#F7F7F7",
  "#FFFFFF",
  "#4682B4",
  "#FF69B4",
  "#FBE7C6",
  "#008080",
  "#CD853F",
  "#C1BDBF",
  "#006666",
  "#F7CAC9",
  "#E2B96F",
  "#C9ADA1",
  "#C4C4C4",
  "#ABABAB",
  "#6E6E6E",
  "#4A4A4A",
  "#262626",
  "#D88E42",
  "#9C3939",
  "#00707C",
  "#16324F",
  "#744253",
  "#FF6F61",
  "#6B5B95",
  "#88D8B0",
  "#F6B352",
  "#006666",
  "#DAA49A",
  "#9B6A6C",
  "#8C4843",
  "#6B7A8F",
  "#A799B7",
  "#EFC050",
  "#4CB5F5",
  "#5D5C61",
  "#C4A35A",
  "#4F5D75",
  "#A5A5A5",
  "#9B9B9B",
  "#919191",
  "#818181",
  "#6F6F6F",
  "#5F5F5F",
  "#4F4F4F",
  "#3F3F3F",
  "#2F2F2F",
  "#1F1F1F",
  "#F8B195",
  "#F67280",
  "#C06C84",
  "#6C5B7B",
  "#355C7D",
  "#8B0000",
  "#B22222",
  "#DC143C",
  "#FF6347",
  "#FF4500",
  "#FFA07A",
  "#FF7F50",
  "#FFD700",
];
let makeChart = function (a, chart) {
  let labesArray = [];
  let countArray = [];
  let backgroundColorArray = [];

  Object.entries(a).forEach((obj) => {
    labesArray.push(obj[0]);
    countArray.push(obj[1]);
    backgroundColorArray.push(colorArray.pop());
  });
  if (labesArray.length == 0) {
    labesArray.push("you have nothing to display");
  }
  if (countArray.length == 0) {
    countArray.push(1);
  }
  if (backgroundColorArray.length == 0) {
    backgroundColorArray.push(colorArray.pop());
  }
  return new Chart(chart, {
    type: "doughnut",
    data: {
      labels: labesArray,
      datasets: [
        {
          data: countArray,
          backgroundColor: backgroundColorArray,
          // hoverBackgroundColor: ["#2e59d9", "#17a673", "#2c9faf"],
          // hoverBorderColor: "rgba(234, 236, 244, 1)",
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        borderColor: "#dddfeb",
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
      },
      legend: {
        display: true,
        position: "right",
        labels: {
          fontColor: "#333",
          fontSize: 14,
          boxWidth: 20,
          padding: 10,
          generateLabels: function (chart) {
            var data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map(function (label, index) {
                var value = data.datasets[0].data[index];
                return {
                  text: label + ": " + value,
                  fillStyle: data.datasets[0].backgroundColor[index],
                  hidden:
                    isNaN(data.datasets[0].data[index]) ||
                    chart.getDatasetMeta(0).data[index].hidden,
                  index: index,
                };
              });
            }
            return [];
          },
        },
      },
      cutoutPercentage: 80,
      // callbacks: {
      //   label: function (tooltipItem, data) {
      //     var label = data.labels[tooltipItem.index];
      //     var value = data.datasets[0].data[tooltipItem.index];
      //     return label + ": " + value;
      //   },
      // },
    },
  });
};
gettrackingclickemailinfor();
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("userToken");

  return window.location.replace(`introduction.html`);
});
