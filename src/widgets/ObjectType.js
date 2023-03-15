import gsap from "gsap";
import { canvasObjects } from "../global";
import { handPos } from "../global";

function keyframeExtractor(e) {
  const attrNames = ["scaleX", "scaleY", "top", "left", "opacity"];
  const target = e.target;
  let k = {};
  for (let i = 0; i < attrNames.length; i++) {
    k[attrNames[i]] = target[attrNames[i]];
  }
  return k;
}

class TextObject {
  // initiate a new object
  // -- link to a certain object with entering config
  constructor(editor, text, obj) {
    this.editor = editor;
    this.relatedText = text;
    this.active = false;
    this.entered = false;
    this.fabric = obj;
    // this.keyframes = [];
    this.enterTL = gsap.timeline();
    this.tl = gsap.timeline();
    this.currAttr = {};
    this.attrNames = ["scaleX", "scaleY", "top", "left", "opacity"];
    this.enterSetting = { effect: "appear", handed: "left", after: "stay" };
    this.create();
    this.addListeners();
  }
  setActive() {
    this.active = true;
  }
  play() {
    console.log(this.enterSetting);
    this.enterTL.progress(0);
  }
  pause() {
    this.enterTL.pause();
    console.log(this.enterTL.paused());
  }
  playAt(tp) {
    this.enterTL.pause();
    this.enterTL.progress(tp);
  }
  changeEnterSetting(d, v) {
    this.enterSetting[d] = v;
    this.enterTL.clear();
    this.createEnter();
  }
  getCurrentAttr() {
    let k = {};
    for (let i = 0; i < this.attrNames.length; i++) {
      k[this.attrNames[i]] = this.fabric.get(this.attrNames[i]);
    }
    return k;
  }
  enter() {
    this.entered = true;
  }
  moveTo(r) {
    let pos = handPos.left[8];
    // console.log(this.fabric.get("left"));
    // console.log(this.fabric.get("top"));
    console.log(r);
    console.log(canvasObjects.curGesture);
    gsap.to(this.fabric, {
      left: pos[0] * r,
      top: pos[1] * r,
      immediateRender: true,
      onUpdate: () => this.editor.canvas.renderAll(),
    });
    // this.fabric.set({ left: pos[0], top: pos[1] });
  }
  createEnter() {
    console.log("Play enter animation");
    let effect = this.enterSetting.effect; //appear, zoom, float
    let after = this.enterSetting.after; //stay, floating, exit
    let editor = this.editor;
    let kf = this.getCurrentAttr();
    this.getCurrentAttr();
    if (effect === "zoom") {
      this.enterTL.fromTo(
        this.fabric,
        { scaleX: 0, scaleY: 0 },
        {
          ...kf,
          duration: 1,
          onUpdate: () => editor.canvas.renderAll(),
        }
      );
    } else if (effect === "float") {
      this.enterTL.fromTo(
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
      console.log(thisobj.getCurrentAttr());
      //   let kf = keyframeExtractor(e);
      //   thisobj.keyframes.push(kf);
      //   thisobj.animate();
    });
  }
}

class ImageObject {
  // initiate a new object
  // -- link to a certain object with entering config
  constructor(editor, text, obj) {
    this.editor = editor;
    this.relatedText = text;
    this.active = false;
    this.entered = false;
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
  setActive() {
    this.active = true;
  }
  play() {
    console.log(this.enterSetting);
    this.enterTL.progress(0);
  }
  pause() {
    this.enterTL.pause();
    console.log(this.enterTL.paused());
  }
  playAt(tp) {
    console.log(tp);
    this.enterTL.pause();
    this.enterTL.progress(tp);
  }
  changeEnterSetting(d, v) {
    this.enterSetting[d] = v;
    this.enterTL.clear();
    this.createEnter();
  }
  getCurrentAttr() {
    let k = {};
    for (let i = 0; i < this.attrNames.length; i++) {
      k[this.attrNames[i]] = this.fabric.get(this.attrNames[i]);
    }
    return k;
  }
  enter() {
    // let kf = this.getCurrentAttr();
    // let editor = this.editor;
    this.entered = true;
    // console.log(canvasObjects.curGesture);
    // this.enterTL.fromTo(
    //   this.fabric,
    //   { scaleX: 0, scaleY: 0 },
    //   {
    //     ...kf,
    //     duration: 1,
    //     onUpdate: () => editor.canvas.renderAll(),
    //   }
    // );
  }
  moveTo() {
    let pos = handPos.left[8];
    gsap.to(this.fabric, {
      left: pos[0],
      top: pos[1],
      onUpdate: () => this.editor.canvas.renderAll(),
    });
  }
  createEnter() {
    console.log("Play enter animation");
    let effect = this.enterSetting.effect; //appear, zoom, float
    let after = this.enterSetting.after; //stay, floating, exit
    let editor = this.editor;
    let kf = this.getCurrentAttr();
    this.getCurrentAttr();
    if (effect === "zoom") {
      this.enterTL.fromTo(
        this.fabric,
        { scaleX: 0, scaleY: 0 },
        {
          ...kf,
          duration: 1,
          onUpdate: () => editor.canvas.renderAll(),
        }
      );
    } else if (effect === "float") {
      this.enterTL.fromTo(
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
      //   let kf = keyframeExtractor(e);
      //   thisobj.keyframes.push(kf);
      //   thisobj.animate();
      console.log(thisobj.getCurrentAttr());
    });
  }
}

export { ImageObject, TextObject };
