import AnimatedHeart1 from "./lotties/heart1.json";
import Stitch from "./Images/stitch.png";

const objectDict = {
  stitch: {
    type: "text",
    renderData: {
      fontFamily:'Impact',
      fontSize: 20,
      text: 'Stitch'
    },
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
  heart:{
    type: "lottie",
    renderData: {
      // replace with json path
      jsonData: AnimatedHeart1
    },
    isList: false,
    enter: {
      params: {
        width: 150,
        height: 120,
        x: 50,
        y: 50,
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
    }
  },
  sticker:{
    type: "image",
    renderData: {
      // replace with json path
      imagePath: Stitch
    },
    isList: false,
    enter: {
      params: {
        width: 120,
        height: 100,
        x: 100,
        y: 400,
        rotation: 10,
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
    }
  }
};

export { objectDict };
