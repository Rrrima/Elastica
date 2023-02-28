const objectDict = {
  stitch: {
    type: "text",
    isList: false,
    enter: {
      params: {
        width: 100,
        height: 120,
        x: 100,
        y: 30,
        rotation: 0,
        speed: null, // only applicable to lottie objects
        ratio: true,
        anchor: false,
      },
      adaParams: {
        width: true,
        height: true,
        x: true,
        y: true,
        rotation: false,
        speed: null,
      },
      handed: "left",
      adaSensitivity: 60,
      vicosity: 30,
      afterEnter: "floating",
    },
    update: {
      "ohana means family": {
        params: {
          width: 100,
          height: 120,
          x: 300,
          y: 30,
          rotation: 0,
          speed: null,
          ratio: true,
          anchor: false,
        },
        adaParams: {
          width: false,
          height: false,
          x: true,
          y: true,
          rotation: true,
          speed: null,
        },
        handed: "left",
        adaSensitivity: 90,
        vicosity: 0,
        afterEnter: "repeat",
      },
    },
  },
};

export { objectDict };
