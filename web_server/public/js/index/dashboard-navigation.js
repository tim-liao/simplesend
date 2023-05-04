document.getElementById("eachpage").addEventListener("click", () => {
  const tour = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true,
      },
      classes: "class-1 class-2",
      scrollTo: { behavior: "smooth", block: "center" },
    },
    useModalOverlay: true,
    theme: "default",
  });
  tour.addStep({
    title: "郵件送出率",
    text: `若您提供的郵件皆為合格，被我方 mail server 發出的郵件即視為送出，若寄件失敗則視為未送出。未送出的詳細資料會在左側的郵件寄送詳細記錄頁面顯示。另外若是有我方 mail server 出現問題而造成郵件未寄出也會視為未送出。(被我方送出不代表已送達。)
    `,
    attachTo: {
      element: "#successrateshepherd",
      on: "bottom",
    },

    buttons: [
      {
        action() {
          this.next();
        },
        text: "Next",
      },
    ],
    id: "creating",
  });
  tour.addStep({
    title: "郵件送達率",
    text: `郵件送出後可能會被對方郵件的伺服器拒絕，或是被歸類到黑名單等等即會被視為未送達，若對方伺服器回傳成功送進使用者信箱則視為送達。`,
    attachTo: {
      element: "#successdeliveryshepherd",
      on: "bottom",
    },

    buttons: [
      {
        action() {
          this.back();
        },
        classes: "shepherd-button-secondary",
        text: "Back",
      },
      {
        action() {
          this.next();
        },
        text: "Next",
      },
    ],
    id: "creating",
  });
  tour.addStep({
    title: "累積使用寄件數量",
    text: `您創建帳號後，在本站中所累積使用過的寄出郵件數量。`,
    attachTo: {
      element: "#usersentemailcountshepherd",
      on: "bottom",
    },

    buttons: [
      {
        action() {
          this.back();
        },
        classes: "shepherd-button-secondary",
        text: "Back",
      },
      {
        action() {
          this.next();
        },
        text: "Next",
      },
    ],
    id: "creating",
  });
  tour.addStep({
    title: "開信率",
    text: `紀錄您所有有使用追蹤開信功能郵件的開信比率。`,
    attachTo: {
      element: "#trackingemailcountrateshepherd",
      on: "bottom",
    },

    buttons: [
      {
        action() {
          this.back();
        },
        classes: "shepherd-button-secondary",
        text: "Back",
      },
      {
        action() {
          this.next();
        },
        text: "Next",
      },
    ],
    id: "creating",
  });
  tour.addStep({
    title: "連結追蹤國家佔比",
    text: `紀錄您所有有使用追蹤連結點擊功能的國家數量及佔比。`,
    attachTo: {
      element: "#countryPieChartshepherd",
      on: "bottom",
    },

    buttons: [
      {
        action() {
          this.back();
        },
        classes: "shepherd-button-secondary",
        text: "Back",
      },
      {
        action() {
          this.next();
        },
        text: "Next",
      },
    ],
    id: "creating",
  });
  tour.addStep({
    title: "連結追蹤瀏覽器佔比",
    text: `紀錄您所有有使用追蹤連結點擊功能的瀏覽器數量及佔比。`,
    attachTo: {
      element: "#browserPieChartshepherd",
      on: "bottom",
    },

    buttons: [
      {
        action() {
          this.back();
        },
        classes: "shepherd-button-secondary",
        text: "Back",
      },
      {
        action() {
          this.next();
        },
        text: "Next",
      },
    ],
    id: "creating",
  });
  tour.addStep({
    title: "使用設備佔比",
    text: `紀錄您所有有使用追蹤連結點擊功能的使用設備數量及佔比（備註：部分設備僅記錄相關作業系統）。`,
    attachTo: {
      element: "#platformPieChartshepherd",
      on: "bottom",
    },

    buttons: [
      {
        action() {
          this.back();
        },
        classes: "shepherd-button-secondary",
        text: "Back",
      },
      {
        action() {
          this.next();
        },
        text: "Next",
      },
    ],
    id: "creating",
  });
  tour.addStep({
    title: "歷史寄件紀錄",
    text: `在上方欄位選擇起始日期以及結束日期，即可查看該時間區間每日的寄件數量。`,
    attachTo: {
      element: "#historysendemailcountshepherd",
      on: "bottom",
    },

    buttons: [
      {
        action() {
          this.back();
        },
        classes: "shepherd-button-secondary",
        text: "Back",
      },
      {
        action() {
          this.next();
        },
        text: "close",
      },
    ],
    id: "creating",
  });
  tour.start();
});
