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
    title: "郵件寄送詳細記錄",
    text: `除了紀錄您提供給本站的詳細寄件資訊，還會紀錄寄出是否失敗的資訊以及時間。`,
    attachTo: {
      element: "#shepherd",
      on: "bottom",
    },

    buttons: [
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
