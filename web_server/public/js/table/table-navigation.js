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
    text: `紀錄您所有透過本站所寄出的郵件詳細記錄（若是再經由本站收受後，被本站的mail server所拒絕則會紀錄在這邊）`,
    attachTo: {
      element: "#shepherd",
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
