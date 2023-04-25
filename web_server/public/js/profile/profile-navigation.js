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
    title: "個人資料以及api key資訊",
    text: `紀錄您提供本服務的個人資料以及您可以使用的api key（含效期）。可以透過點擊生成新的api key按鈕生成新的api key，需注意的是一週內只能生成一次新的，舊的api key在新的api key生成之後效期只剩下七天。`,
    attachTo: {
      element: "#profileandapikey",
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
    title: "您的網域以及狀態",
    text: `若您想要透過本服務進行寄件，您所使用的寄件名稱需要進行驗證後才可以寄件。驗證方式為：將您欲申請的網域名稱在下方欄位進行提交，提交後會產生一組字串，將該字串放到您的DNS設定中，類型選擇"TXT"、名稱打入"txt"、在內容值中輸入本服務提供的字串，即完成前置作業。設定好後約等1小時至2小時不等，在下方欄位對您的域名進行驗證(verify)，驗證成功即可使用該名字進行寄件服務。`,
    attachTo: {
      element: "#domainshepherd",
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
