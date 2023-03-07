import gsap from "gsap";

function keyframeExtractor(e) {
  const attrNames = ["scaleX", "scaleY", "top", "left"];
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
    this.tl = gsap.timeline();
    this.currAttr = {};
    this.create();
    this.addListeners();
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
    this.fabric.set(this.keyframes[0]);
    // gsap.to(this.fabric, { ...this.keyframes[1], duration: 1 });
    this.playTl();
    // this.tl.play();
  }
  addListeners() {
    let relatedText = this.relatedText;
    let thisobj = this;
    this.fabric.on("modified", function (e) {
      thisobj.keyframes.push(keyframeExtractor(e));
    });
    this.fabric.on("mousedblclick", function (e) {
      thisobj.animate();
    });
  }
}

export { ImageObject };
