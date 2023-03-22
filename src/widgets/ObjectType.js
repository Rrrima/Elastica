import gsap from "gsap";
import { canvasObjects, handPos, handPosArr } from "../global";
import HandRecords from "./HandRecords";
import { C } from "../global";
import { gaussianBlending } from "./utils";

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
    this.animateFocus = false; // indicate the intentionality detected
    this.animateReady = false; // indicate the active window start
    this.timeThred = 1500;
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
    this.enterSetting = {
      effect: "appear",
      handed: "left",
      after: "stay",
      customize: false,
    };
    this.updates = {};
    // {focusedText:{}}
    // attr: thisobj.getCurrentAttr(),
    // setting: { effect: "transform", handed: "left", after: "stay" },
    this.create();
    this.addListeners();
    this.fixAttr = this.getCurrentAttr();
    this.handRecord = new HandRecords();
  }
  endAnimationFocus() {
    this.animateFocus = false;
  }
  detectIntentionality() {
    // for preview;
    // detect intentionality whenever animteFocus == false
    // for performance detect for 600ms
    // called when camera on
    this.animateReady = true; // open active window
    this.animateFocus = false; // reset to be not the focus
    const curText = canvasObjects.focusedText;
    let status = "enter";
    let handed = "left";
    // get status
    if (this.relatedText !== curText) {
      status = "update";
    }
    if (status === "enter") {
      handed = this.enterSetting.handed;
    } else {
      handed = this.updates[curText].setting.handed;
    }
    const intention = this.isIntentional(handed);
    if (
      intention.type === "general" &&
      intention.confidence > C.handStatic.thred
    ) {
      this.animateFocus = true; // start adaptation from t
      this.t = 0;
    }
    if (intention.type === "customize") {
      if (intention.confidence[0] > C.sim.thred) {
        this.animateFocus = true;
        this.t = 0;
      }
      //   else if (intention.confidence[1] > C.handStatic.thred) {
      //     this.animateFocus = true;
      //   }
    }
  }
  animateAtMark() {
    if (this.relatedText === canvasObjects.focusedText) {
      this.animateEnter();
    } else {
      this.animateUpdate(canvasObjects.focusedText);
    }
  }
  exitCanvas() {
    this.editor.canvas.remove(this.fabric);
    this.editor.canvas.renderAll();
  }
  revert() {
    if (canvasObjects.focusedText === this.relatedText) {
      this.getReady();
    } else {
      const preText = canvasObjects.getPreviousKey(Object.keys(this.updates));
      if (preText) {
        this.fabric.set(this.updates[preText].attr);
      } else {
        this.fabric.set(this.fixAttr);
      }
      this.editor.canvas.renderAll();
    }
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
  getReady(pos) {
    const rdict = { ...this.fixAttr };
    rdict.opacity = 0;
    if (!pos) {
      this.fabric.set(rdict);
    }
  }
  animateEnter() {
    this.fabric.set("selectable", true);
    // this.fixAttr : the enter point
    this.getReady();
    const kf = this.fixAttr;
    const effect = this.enterSetting.effect;
    const editor = this.editor;
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
    } else {
      gsap.to(this.fabric, {
        ...this.fixAttr,
        immediateRender: true,
        onUpdate: () => this.editor.canvas.renderAll(),
      });
    }
  }
  animateUpdate(t) {
    this.fabric.set("selectable", true);
    //
    this.revert();
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
  //   createUpdate(relatedText) {
  //     const d = {
  //       relatedText: relatedText,
  //       effect: "trasform",
  //       handed: "left",
  //       after: "stay",
  //     };
  //   }
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
  gaussianBlending(pm) {
    const fa = this.fixAttr;
    let ts = this.t / C.time.duration;
    let bpm = {};
    Object.keys(pm).forEach((k) => {
      if (k !== "opacity") {
        bpm[k] = gaussianBlending(pm[k], fa[k], ts);
      } else {
        bpm[k] = pm[k];
      }
    });
    return bpm;
  }
  getAnimationParams() {
    // called for adaptation
    const curText = canvasObjects.focusedText;
    let ts = this.t / C.time.duration;
    this.t += C.time.step;
    let opacity = ts;
    if (ts > 1) {
      opacity = 1;
    }
    const fa = this.fixAttr;
    if (curText === this.relatedText) {
      const handed = this.enterSetting.handed;
      const center = handPos.getHandCenters()[handed];
      if (this.enterSetting.customize) {
        let pm = this.handRecord.getParams();
        pm = {
          left: center[0] + pm.dl,
          top: center[1] + pm.dt,
          opacity: opacity,
          scaleX: pm.sx,
          scaleY: pm.sy,
          height: 100,
        };
        let intention = this.isIntentional().confidence[0];
        return this.gaussianBlending(pm);
      } else {
        const effect = this.enterSetting.effect;
        let pm = {};
        if (effect === "float") {
          const top =
            center[1] - (fa.height * fa.scaleY) / 2 - 30 * (1 - opacity);
          pm = { left: center[0], top: top, opacity: opacity };
        } else if (effect === "zoom") {
          const scaleX = fa.scaleX * ts;
          const scaleY = fa.scaleY * ts;
          const top = center[1];
          pm = {
            left: center[0],
            top: top,
            scaleX: scaleX,
            scaleY: scaleY,
            opacity: opacity,
          };
        } else if (effect === "appear") {
          pm = {
            left: center[0],
            top: center[1],
            opacity: opacity,
          };
        }
        return this.gaussianBlending(pm);
      }
    } else {
    }
  }
  animateTo(params) {
    gsap.to(this.fabric, {
      ...params,
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
  isIntentional(handed) {
    if (this.animateReady) {
      // start intentionality detection
      const curText = canvasObjects.focusedText;
      if (this.relatedText === curText) {
        // enter
        if (this.handRecord.record[curText]) {
          const sim = this.handRecord.getSimilarity(); // euclidean distance between vector
          const confidence = Math.max(...sim);
          //   const weights = normalizeSumOne(sim);
          return {
            type: "customize",
            confidence: [confidence, handPosArr.isIntentional(handed)],
          };
        } else {
          return {
            type: "general",
            confidence: handPosArr.isIntentional(handed),
          };
        }
      }
    } else {
      console.log("activate object for intentionality detection");
    }
  }
  addListeners() {
    let relatedText = this.relatedText;
    let thisobj = this;
    this.fabric.on("modified", function (e) {
      if (relatedText === canvasObjects.focusedText) {
        if (!canvasObjects.customizeMode) {
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

//////////
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
