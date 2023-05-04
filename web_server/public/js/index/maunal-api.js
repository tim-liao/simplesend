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
    text: `儀表板中會顯示各式各樣的郵件追蹤資訊，例如：單日累積寄件數量、信件被打開的機率等等`,
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
    text: `這邊可以看到詳細的寄件紀錄，包含你寄出時的所有資訊，以及何時寄出等詳細的資訊。`,
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
    title: "失敗郵件名單",
    text: `紀錄您寄出的郵件，但是郵件地址無效的名單，包含寄出時間以及失敗原因。`,
    attachTo: {
      element: "#bounceemail",
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
    title: "GitHub 頁面",
    text: `本站作者的 GitHub 網站，歡迎查閱。`,
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
    title: "介紹頁面",
    text: `介紹本站的宗旨、寄件方式以及網站架構。`,
    attachTo: {
      element: "#introduction",
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
    text: `點擊後會顯示個人資料及登出按鈕。個人資料頁面可以獲得您的 api key 以及驗證您的域名作為可以使用的寄件名稱。`,
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
        text: "Close",
      },
    ],
    id: "creating",
  });

  tour.start();
});
