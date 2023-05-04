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
    title: "失敗寄送名單",
    text: `是不是有些郵件寄出後杳無音信？其中一個原因是寄送失敗，這邊會紀錄失敗原因、紀錄時間。`,
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
