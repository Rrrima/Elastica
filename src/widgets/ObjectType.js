import gsap from "gsap";

function keyframeExtractor(e) {
  const attrNames = ["scaleX", "scaleY", "top", "left", "opacity"];
  const target = e.target;
  let k = {};
  for (let i = 0; i < attrNames.length; i++) {
    k[attrNames[i]] = target[attrNames[i]];
  }
  return k;
}

class ImageObject {
  // initiate a new object
  // -- link to a certain object with entering config
  constructor(editor, text, obj) {
    this.editor = editor;
    this.relatedText = text;
    this.fabric = obj;
    this.keyframes = [];
    this.enterTL = gsap.timeline();
    this.tl = gsap.timeline();
    this.currAttr = {};
    this.attrNames = ["scaleX", "scaleY", "top", "left", "opacity"];
    this.enterSetting = { effect: "appear", handed: "left", after: "stay" };
    this.create();
    this.addListeners();
  }
  changeEnterSetting(d, v) {
    this.enterSetting[d] = v;
    this.enter();
  }
  getCurrentAttr() {
    let k = {};
    for (let i = 0; i < this.attrNames.length; i++) {
      k[this.attrNames[i]] = this.fabric.get(this.attrNames[i]);
    }
    return k;
  }
  enter() {
    let effect = this.enterSetting.effect; //appear, zoom, float
    let after = this.enterSetting.after; //stay, floating, exit
    let editor = this.editor;
    let kf = this.getCurrentAttr();
    this.getCurrentAttr();
    if (effect === "zoom") {
      gsap.fromTo(
        this.fabric,
        { scaleX: 0, scaleY: 0 },
        {
          ...kf,
          duration: 1,
          onUpdate: () => editor.canvas.renderAll(),
        }
      );
    } else if (effect === "float") {
      gsap.fromTo(
        this.fabric,
        { top: kf.top + 30, opacity: 0 },
        {
          ...kf,
          duration: 1,
          onUpdate: () => editor.canvas.renderAll(),
        }
      );
    }
  }
  create() {
    this.editor.canvas.add(this.fabric);
  }
  playTl() {
    this.tl = gsap.timeline();
    for (let i = 0; i < this.keyframes.length; i++) {
      if (i > 0) {
        this.tl.to(this.fabric, { ...this.keyframes[i], duration: 1 }, ">");
      } else {
        this.tl.to(this.fabric, { ...this.keyframes[i], duration: 1 });
      }
    }
  }
  animate() {
    // this.fabric.set(this.keyframes[0]);
    gsap.to(this.fabric, { scaleX: 1, scaleY: 1, duration: 1 });
    console.log("animate");
    // this.playTl();
    // this.tl.play();
  }
  addListeners() {
    let relatedText = this.relatedText;
    let thisobj = this;
    // this.fabric.on("modified", function (e) {
    //   thisobj.keyframes.push(keyframeExtractor(e));
    // });
    this.fabric.on("mousedblclick", function (e) {
      let kf = keyframeExtractor(e);
      thisobj.keyframes.push(kf);
      //   thisobj.animate();
    });
  }
}

export { ImageObject };
