import { fabric } from "fabric";
import lottie from "lottie-web";

const LottieFabric = fabric.util.createClass(fabric.Image, {
  type: "lottie",
  lockRotation: true,
  lockSkewingX: true,
  lockSkewingY: true,
  srcFromAttribute: false,

  initialize: function (data, options) {
    if (!options.width) options.width = 480;
    if (!options.height) options.height = 480;

    // this.path = path
    this.tmpCanvasEl = fabric.util.createCanvasElement();
    this.tmpCanvasEl.width = options.width;
    this.tmpCanvasEl.height = options.height;

    this.lottieItem = lottie.loadAnimation({
      renderer: "canvas",
      loop: true,
      autoplay: true,
      animationData: data,
      rendererSettings: {
        context: this.tmpCanvasEl.getContext("2d"),
        preserveAspectRatio: "xMidYMid meet",
      },
    });

    // this.lottieItem.addEventListener('DOMLoaded', () => {
    //   console.log('DOMLoaded')
    // })

    this.lottieItem.addEventListener("enterFrame", (e) => {
      this.canvas?.requestRenderAll();
    });

    this.callSuper("initialize", this.tmpCanvasEl, options);
  },

  play: function () {
    this.lottieItem.play();
  },
  stop: function () {
    this.lottieItem.stop();
  },
  // getSrc: function () {
  //   return this.path
  // },
});

LottieFabric.fromObject = function (_object, callback) {
  const object = fabric.util.object.clone(_object);
  fabric.Image.prototype._initFilters.call(
    object,
    object.filters,
    function (filters) {
      object.filters = filters || [];
      fabric.Image.prototype._initFilters.call(
        object,
        [object.resizeFilter],
        function (resizeFilters) {
          object.resizeFilter = resizeFilters[0];
          fabric.util.enlivenObjects(
            [object.clipPath],
            function (enlivedProps) {
              object.clipPath = enlivedProps[0];
              const fabricLottie = new fabric.Lottie(object.src, object);
              callback(fabricLottie, false);
            }
          );
        }
      );
    }
  );
};

LottieFabric.async = true;

export default LottieFabric;
