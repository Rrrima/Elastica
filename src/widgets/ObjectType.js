import gsap from "gsap";
import { canvasObjects } from "../global";
import { handPos } from "../global";
import { createRoot } from "react-dom/client";
import ConfigPanel from "../mainPanels/ConfigPanel";
import { FaceRetouchingOffSharp } from "@mui/icons-material";

function keyframeExtractor(e) {
  const attrNames = [
    "scaleX",
    "scaleY",
    "top",
    "left",
    "opacity",
    "dynamicMinWidth",
    "height",
  ];
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
    if (canvasObjects.objectDict[this.relatedText]) {
      this.objectId =
        this.relatedText +
        "-" +
        canvasObjects.objectDict[this.relatedText].length;
    } else {
      this.objectId = this.relatedText + "-0";
    }
    this.animateFocus = false;
    this.active = false;
    this.entered = false;
    this.status = null;
    this.fabric = obj;
    this.customize = false;
    this.t = 0;
    // this.keyframes = [];
    this.enterTL = gsap.timeline();
    this.tl = gsap.timeline();
    this.attrNames = [
      "scaleX",
      "scaleY",
      "top",
      "left",
      "opacity",
      "dynamicMinWidth",
      "height",
    ];
    this.enterSetting = { effect: "appear", handed: "left", after: "stay" };
    this.updates = [];
    this.create();
    this.addListeners();
    this.fixAttr = this.getCurrentAttr();
  }
  enterWithHand(effect) {
    this.animateFocus = true;
    this.status = "enter";
    this.effect = effect;
  }
  endEnterWithHand() {
    this.t = 0;
    this.animateFocus = false;
    this.status = null;
    this.moveBack();
  }
  animateEnter() {
    this.fabric.set("selectable", true);
    gsap.to(this.fabric, {
      ...this.fixAttr,
      immediateRender: true,
      onUpdate: () => this.editor.canvas.renderAll(),
    });
  }
  animateUpdate(t) {
    this.fabric.set("selectable", true);
    const thisfab = this.fabric;
    gsap.to(this.fabric, {
      ...this.updates[t].attr,
      immediateRender: true,
      onUpdate: () => {
        this.editor.canvas.renderAll();
        // console.log("after enter!");
        // console.log(thisfab);
      },
    });
    // console.log(" =====  all updated element!! ====");
    // console.log(this.fabric);
  }
  createUpdate(relatedText) {
    const d = {
      relatedText: relatedText,
      effect: "trasform",
      handed: "left",
      after: "stay",
    };
  }
  disabled() {
    this.fabric.set("opacity", 0.3);
    this.fabric.set("selectable", false);
  }
  moveBack() {
    gsap.to(this.fabric, {
      ...this.fixAttr,
      immediateRender: true,
      onUpdate: () => {
        this.editor.canvas.renderAll();
      },
    });
  }
  setActive() {
    this.active = true;
    this.editor.canvas.setActiveObject(this.fabric);
    this.editor.canvas.renderAll();
  }
  deactivate() {
    this.active = false;
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
    this.enterTL = gsap.timeline();
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
  moveTo(pos) {
    gsap.to(this.fabric, {
      left: pos[0],
      top: pos[1],
      onUpdate: () => this.editor.canvas.renderAll(),
    });
  }
  animateTo(params) {
    // const curGes = canvasObjects.curGesture;
    // let offSets = [0, 0];
    // let dim = null;
    // if (curGes === "staging") {
    //   offSets = [0, -20];
    // } else if (curGes === "pinch") {
    //   offSets = [30, 0];
    //   dim = this.fabric.get("height");
    // }
    // let params = handPos.getAnimationParams(
    //   curGes,
    //   this.enterSetting.handed,
    //   r,
    //   offSets,
    //   dim
    // );
    // console.log(curGes);
    // console.log(params);
    // console.log(this.fabric.get("left"));
    // console.log(this.fabric.get("top"));
    gsap.to(this.fabric, {
      ...params,
      height: 2,
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
    let kf = this.fixAttr;
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
    } else {
      this.enterTL.fromTo(
        this.fabric,
        { ...kf },
        {
          ...kf,
          duration: 1,
          onUpdate: () => editor.canvas.renderAll(),
        }
      );
    }
    if (effect === "customize") {
      this.customize = true;
      canvasObjects.startCustomization();
    } else {
      canvasObjects.endCustomization();
      canvasObjects.removeHand("left");
      this.customize = false;
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
  changeUpdateSetting(dim, val) {
    this.updates[canvasObjects.focusedText].setting[dim] = val;
    this.update();
  }
  update() {
    const base = this.updates[canvasObjects.focusedText].attr;
    const effect = this.updates[canvasObjects.focusedText].setting["effect"];
    console.log(effect);
    gsap.to(this.fabric, {
      ...base,
      duration: 0,
      onUpdate: () => this.editor.canvas.renderAll(),
    });
    if (effect === "disappear") {
      gsap.to(this.fabric, {
        opacity: 0,
        duration: 1,
        onUpdate: () => this.editor.canvas.renderAll(),
      });
    } else if (effect === "seesaw") {
      gsap.fromTo(
        this.fabric,
        { top: base.top },
        {
          top: base.top - 20,
          yoyo: true,
          repeat: 3,
          duration: 0.5,
          ease: "sin.inOut",
          onUpdate: () => this.editor.canvas.renderAll(),
        }
      );
    }
  }
  addListeners() {
    let relatedText = this.relatedText;
    let thisobj = this;
    this.fabric.on("modified", function (e) {
      if (relatedText === canvasObjects.focusedText) {
        if (thisobj.enterSetting.effect !== "customize") {
          console.log("fix position change");
          thisobj.fixAttr = thisobj.getCurrentAttr();
        }
      } else {
        thisobj.updates[canvasObjects.focusedText] = {
          attr: thisobj.getCurrentAttr(),
          setting: { effect: "transform", handed: "left", after: "stay" },
        };
        canvasObjects.addToUpdate(canvasObjects.focusedText, thisobj);
        canvasObjects.rerenderConfig();
      }
    });

    // const container = document.getElementById("configContainer");
    // const root = createRoot(container);
    // root.render(
    //   <ConfigPanel selectedText={canvasObjects.focusedText} status={"update"} />
    // );
    this.fabric.on("mousedblclick", function (e) {
      if (relatedText !== canvasObjects.focusedText) {
        thisobj.updates[canvasObjects.focusedText] = {
          attr: thisobj.getCurrentAttr(),
          setting: { effect: "transform", handed: "left", after: "stay" },
        };
        canvasObjects.addToUpdate(canvasObjects.focusedText, thisobj);
        canvasObjects.rerenderConfig();
      }
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
  moveTo(pos) {
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
