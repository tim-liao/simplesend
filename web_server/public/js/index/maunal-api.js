document.getElementById("maunal-api").addEventListener("click", () => {
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
    title: "歡迎來到我的網站",
    text: `儀表板中會顯示各式各樣的您的寄件資訊，例如：單日累積寄件數量、信件被打開的機率等等`,
    attachTo: {
      element: "#dashboard",
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
    title: "郵件寄件紀錄",
    text: `這邊可以看到詳細的寄件紀錄，包含你寄出時的所有資訊，以及何時寄出等等。`,
    attachTo: {
      element: "#emaillog",
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
    title: "GitHub頁面",
    text: `點擊後會導覽到這個網站的GitHub頁面`,
    attachTo: {
      element: "#github",
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
    title: "個人資料及登出",
    text: `點擊後會顯示個人資料及登出按鈕。個人資料頁面可以獲得您的api key以及驗證您可以使用的寄件名稱。`,
    attachTo: {
      element: "#userDropdown",
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

  tour.start();
});
