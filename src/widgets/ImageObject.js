import gsap from "gsap";
import { canvasObjects, handPos, handPosArr } from "../global";
import HandRecords from "./HandRecords";
import { C } from "../global";
import { gaussianBlending, isValid, generateRandomId } from "./utils";

class ImageObject {
  // initiate a new object
  // -- link to a certain object with entering config
  constructor(editor, text, obj) {
    this.editor = editor;
    this.relatedText = text;
    this.type = "image";
    // if (canvasObjects.objectDict[this.relatedText]) {
    //   this.objectId =
    //     this.relatedText +
    //     "-" +
    //     canvasObjects.objectDict[this.relatedText].length;
    // } else {
    //   this.objectId = this.relatedText + "-0";
    // }
    this.objectId = this.relatedText + "-" + generateRandomId(3);
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
      "angle",
    ];
    this.enterSetting = {
      effect: "appear",
      handed: "left",
      after: "stay",
      customize: false,
      timeThred: 1000,
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
  getTimeThred() {
    if (this.relatedText === canvasObjects.focusedText) {
      this.timeThred = this.enterSetting.timeThred;
    } else {
      this.timeThred =
        this.updates[canvasObjects.focusedText].setting.timeThred;
    }
    return this.timeThred;
  }
  //   endAnimationFocus() {
  //     this.animateFocus = false;
  //     this.animateReady = false;
  //   }
  detectIntentionality() {
    // for preview;
    // detect intentionality whenever animteFocus == false
    // for performance detect for 600ms
    // called when camera on
    this.animateReady = true; // open active window
    this.animateFocus = true; // reset to be not the focus
    const curText = canvasObjects.focusedText;
    let status = "enter";
    let handed = "left";
    let delayFocus = 500;
    if (canvasObjects.mode === "presentation") {
      delayFocus = 0;
    }
    // get status
    if (this.relatedText !== curText) {
      status = "update";
    }
    if (status === "enter") {
      // console.log(delayFocus);
      handed = this.enterSetting.handed;
      const intention = this.isIntentional(handed);
      // console.log(intention);
      if (
        intention.type === "general" &&
        intention.confidence > C.handStatic.thred
      ) {
        this.t = 0;
        this.getReady(handPos.handCenterVec[handed]);
        setTimeout(() => {
          this.animateFocus = true; // start adaptation from t
        }, delayFocus);
      }
      if (intention.type === "customize") {
        if (intention.confidence[0] > C.sim.thred) {
          this.t = 0;
          this.getReady(handPos.handCenterVec[handed]);
          setTimeout(() => {
            this.animateFocus = true;
          }, delayFocus);
        } else if (intention.confidence[1] === 1) {
          this.t = 0;
          this.getReady(handPos.handCenterVec[handed]);
          setTimeout(() => {
            this.animateFocus = true;
          }, delayFocus);
        }
      }
    } else {
      this.t = 0;
      setTimeout(() => {
        this.animateFocus = true;
      }, delayFocus);
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
    // this.animateFocus = true;
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
    const rkey = canvasObjects.focusedText;
    const rdict = { ...this.fixAttr };
    rdict.opacity = 0;
    if (pos && this.handRecord.record[rkey]) {
      const record = this.handRecord.record[rkey][0].objAttr;
      rdict.left = pos[0];
      rdict.top = pos[1];
      rdict.scaleX = record.scaleX;
      rdict.scaleY = record.scaleY;
    }
    this.fabric.set(rdict);
    this.editor.canvas.renderAll();
  }
  animateEnter() {
    this.fabric.set("selectable", true);
    // this.fixAttr : the enter point
    this.getReady();
    const kf = this.fixAttr;
    // console.log(kf);
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
      },
    });
    const effect = this.updates[t].setting.effect;
    if (effect === "exit") {
      gsap.to(this.fabric, {
        opacity: 0,
        duration: 1,
        onUpdate: () => this.editor.canvas.renderAll(),
      });
    } else if (effect === "seesaw") {
      gsap.fromTo(
        this.fabric,
        { top: this.updates[t].attr.top },
        {
          top: this.updates[t].attr.top - 20,
          yoyo: true,
          repeat: 3,
          duration: 0.5,
          ease: "sin.inOut",
          onUpdate: () => this.editor.canvas.renderAll(),
        }
      );
    }
  }
  disabled() {
    this.fabric.set("opacity", 0);
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
    // this.createEnter();
    this.animateEnter();
  }
  getCurrentAttr() {
    let k = {};
    for (let i = 0; i < this.attrNames.length; i++) {
      k[this.attrNames[i]] = this.fabric.get(this.attrNames[i]);
    }
    if (k.angle > 180) {
      k.angle = k.angle - 360;
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
  gaussianBlending(status, pm) {
    let fa = this.fixAttr;
    if (status === "update") {
      // console.log("update!");
      fa = this.updates[canvasObjects.focusedText].attr;
    }
    let ts = this.t / this.timeThred;
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
    let opacity = ts * 2;
    if (ts > 0.4) {
      opacity = 1;
    }
    const fa = this.fixAttr;
    // enter adaptation
    if (curText === this.relatedText) {
      const handed = this.enterSetting.handed;
      if (handed === "none") {
        return;
      }
      const center = handPos.getHandCenters()[handed];
      if (this.enterSetting.customize && this.handRecord.record[curText]) {
        let pm = this.handRecord.getParams(handed);
        if (isValid(pm)) {
          pm = {
            left: center[0] + pm.dl,
            top: center[1] + pm.dt,
            angle: pm.da,
            opacity: opacity,
            scaleX: pm.sx,
            scaleY: pm.sy,
          };
          // let intention = this.isIntentional().confidence[0];
          return this.gaussianBlending("enter", pm);
        }
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
        return this.gaussianBlending("enter", pm);
      }
    } else {
      // update adaptation
      const settings = this.updates[curText].setting;
      const attr = this.updates[curText].attr;
      const handed = settings.handed;
      if (handed === "none") {
        return;
      }
      const center = handPos.getHandCenters()[handed];
      //   console.log(settings);
      if (settings.customize && this.handRecord.record[curText]) {
        if (settings.effect === "follow") {
          let pm = this.handRecord.getParams(handed);
          if (isValid(pm)) {
            pm = {
              left: center[0] + pm.dl,
              top: center[1] + pm.dt,
              angle: pm.da,
              scaleX: pm.sx,
              scaleY: pm.sy,
            };
            // let intention = this.isIntentional().confidence[0];
            return pm;
          }
        } else if (settings.effect === "transform") {
          let pm = this.handRecord.getParams(handed);
          if (isValid(pm)) {
            pm = {
              left: center[0] + pm.dl,
              top: center[1] + pm.dt,
              angle: pm.da,
              scaleX: pm.sx,
              scaleY: pm.sy,
            };
            // let intention = this.isIntentional().confidence[0];
            return this.gaussianBlending("update", pm);
          }
        } else if (settings.effect === "seesaw") {
          let pm = this.handRecord.getParams(handed);
          if (isValid(pm)) {
            pm = {
              left: attr.left + handPosArr.getDeltaX(handed),
              top: attr.top + handPosArr.getDeltaY(handed),
              angle: pm.da,
              scaleX: pm.sx,
              scaleY: pm.sy,
            };
            // let intention = this.isIntentional().confidence[0];

            return pm;
          }
        } else if (settings.effect === "exit") {
          let pm = this.handRecord.getParams(handed);
          if (isValid(pm)) {
            pm = {
              left: center[0] + pm.dl,
              top: center[1] + pm.dt,
              opacity: 1 - opacity,
              angle: pm.da,
              scaleX: pm.sx,
              scaleY: pm.sy,
            };
            // let intention = this.isIntentional().confidence[0];
            return this.gaussianBlending("update", pm);
          }
        }
      } else {
        const effect = settings.effect;
        let pm = {};
        if (effect === "follow") {
          pm = { left: center[0], top: center[1] };
          return pm;
        } else if (effect === "exit") {
          pm = { opacity: 1 - opacity };
          return pm;
        } else if (effect === "transform") {
          pm = {
            left: center[0],
            top: center[1],
          };
          return this.gaussianBlending("update", pm);
        } else if (effect === "seesaw") {
          pm = {
            left: attr.left + handPosArr.getDeltaX(handed),
            top: attr.top + handPosArr.getDeltaY(handed),
          };
          // console.log(pm);
          return pm;
        }
      }
    }
  }

  animateTo(params) {
    if (isValid(params)) {
      gsap.to(this.fabric, {
        ...params,
        immediateRender: true,
        onUpdate: () => this.editor.canvas.renderAll(),
      });
    } else {
      //   console.log("not valid!");
    }

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
  }
  update() {
    const base = this.updates[canvasObjects.focusedText].attr;
    const effect = this.updates[canvasObjects.focusedText].setting["effect"];
    gsap.to(this.fabric, {
      ...base,
      duration: 0,
      onUpdate: () => this.editor.canvas.renderAll(),
    });
    if (effect === "exit") {
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
      if (handed === "none") {
        return {
          type: "general",
          confidence: 0,
        };
      }
      if (this.relatedText === curText) {
        // enter
        if (this.handRecord.record[curText]) {
          const sim = this.handRecord.getSimilarity(handed); // euclidean distance between vector
          let confidence = 0;
          if (sim) {
            confidence = Math.max(...sim);
          }
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
  afterEnter(d) {
    gsap.to(this.fabric, {
      ...this.fixAttr,
      onUpdate: () => this.editor.canvas.renderAll(),
    });
    if (this.enterSetting.after === "exit") {
      gsap.to(this.fabric, {
        opacity: 0,
        duration: 0.5,
        delay: d,
        onUpdate: () => this.editor.canvas.renderAll(),
      });
    }
    this.animateReady = false;
    this.animateFocus = false;
  }
  afterUpdate(t, d) {
    const fa = this.updates[t].attr;
    const setting = this.updates[t].setting;
    if (setting.after === "exit") {
      gsap.to(this.fabric, {
        opacity: 0,
        duration: 0.5,
        delay: d,
        onUpdate: () => this.editor.canvas.renderAll(),
      });
    } else if (setting.after === "back") {
      if (setting.effect === "follow") {
        gsap.to(this.fabric, {
          ...fa,
          delay: d,
          onUpdate: () => this.editor.canvas.renderAll(),
        });
      } else {
        const preText = canvasObjects.getPreviousKey(Object.keys(this.updates));
        let backto = null;
        if (preText) {
          backto = this.updates[preText].attr;
        } else {
          backto = this.fixAttr;
        }
        gsap.to(this.fabric, {
          ...backto,
          delay: d,
          onUpdate: () => this.editor.canvas.renderAll(),
        });
      }
    } else if (setting.after === "stay") {
      if (setting.effect !== "follow") {
        gsap.to(this.fabric, {
          ...fa,
          delay: d,
          onUpdate: () => this.editor.canvas.renderAll(),
        });
      }
    }
    this.animateReady = false;
    this.animateFocus = false;
  }
  addListeners() {
    let relatedText = this.relatedText;
    let thisobj = this;
    this.fabric.on("modified", function (e) {
      console.log(thisobj.fabric);
      if (!canvasObjects.customizeMode) {
        if (relatedText === canvasObjects.focusedText) {
          console.log("fix position change");
          thisobj.fixAttr = thisobj.getCurrentAttr();
        } else {
          thisobj.updates[canvasObjects.focusedText] = {
            attr: thisobj.getCurrentAttr(),
            setting: {
              effect: "transform",
              handed: "left",
              after: "stay",
              customize: false,
              timeThred: 3000,
            },
          };
          console.log("updated!");
          canvasObjects.addToUpdate(canvasObjects.focusedText, thisobj);
          //   canvasObjects.rerenderConfig();
        }
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
          setting: {
            effect: "transform",
            handed: "left",
            after: "stay",
            customize: false,
            timeThred: 3000,
          },
        };
        canvasObjects.addToUpdate(canvasObjects.focusedText, thisobj);
        canvasObjects.rerenderConfig();
      }
    });
  }
}

export { ImageObject };
