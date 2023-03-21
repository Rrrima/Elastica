import { HandPos, HandPosArr } from "./widgets/HandPos";
import { createRoot } from "react-dom/client";
import ConfigPanel from "./mainPanels/ConfigPanel";
import { fabric } from "fabric";
import gsap from "gsap";
import ScriptTracker from "./widgets/ScriptTracker";
import AnimationDriver from "./widgets/AnimationDriver";
import { CurrencyFranc } from "@mui/icons-material";

class CanvasObject {
  constructor() {
    this.canvas = null; // == editor
    this.objectDict = {}; // selectedText -> [obj,obj]
    this.updateDict = {}; // selectedText -> [obj,obj]
    this.idDict = {};
    this.textRank = {};
    this._n_marks = 0; // count id for each object
    this.focus = null;
    this.focusedText = null;
    this.curGesture = null;
    this.canmeraOn = false;
    this.root = null;
    this.markDict = {}; // seletedText -> {'marker': marker dom, 'pos':}
    this.handIndicators = { left: {}, right: {} };
    this.allFingers = ["thumb", "index", "middle", "ring", "pinky"];
    this.indicateColor = "blue";
    this.textEditor = null;
    this.customizaMode = false;
    this.handed = "left";
    //   createRoots() {
    //     console.log("create root");
    //     const container = document.getElementById("configContainer");
    //     const root = createRoot(container);
    //     this.roots = { configRoot: root };
    //   }
  }

  handleCustomization(event) {
    const curObj = this.focus;
    if (event.key === "r") {
      curObj.handRecord.addToRecord();
    }
  }
  startCustomization() {
    this.customizaMode = true;
    document.addEventListener("keydown", this.handleCustomization);
  }
  endCustomization() {
    this.customizaMode = false;
    document.removeEventListener("keydown", this.handleCustomization);
  }
  initializeIndicator(handed) {
    this.allFingers.forEach((f) => {
      this.handIndicators[handed][f] = new fabric.Circle({
        radius: 6,
        fill: "red",
        left: 0,
        top: 0,
        opacity: 0,
      });
      this.canvas.canvas.add(this.handIndicators[handed][f]);
    });
  }
  removeHand(handed) {
    // console.log("remove!");
    this.allFingers.forEach((f) => {
      this.handIndicators[handed][f].set({
        opacity: 0,
      });
    });
    this.canvas.canvas.renderAll();
  }
  visHand(handed) {
    const ftPos = handPos.getFingertipPos(handed, "all");
    // let ftAng = handPos.getVisHandAngle(handed);
    const fill = this.indicateColor;
    // var tl = gsap.timeline();
    // this.allFingers.forEach((f) => {
    //   let pm = { top: ftPos[f][1], left: ftPos[f][0], opacity: 1 };
    //   gsap.to(this.handIndicators[handed][f], {
    //     ...pm,
    //     immediateRender: true,
    //     onUpdate: () => this.canvas.canvas.renderAll(),
    //   });
    // });
    if (handPos.isDetected[handed]) {
      this.allFingers.forEach((f, idx) => {
        let pm = {
          top: ftPos[f][1],
          left: ftPos[f][0],
          opacity: 1,
          //   opacity: ftAng[idx],
          fill: fill,
        };
        this.handIndicators[handed][f].set(pm);
      });
    } else {
      this.allFingers.forEach((f) => {
        let pm = { opacity: 0 };
        this.handIndicators[handed][f].set(pm);
      });
    }

    this.canvas.canvas.renderAll();
  }
  getPos(mark) {
    const pnode = mark.parentNode;
    const index = Array.prototype.indexOf.call(pnode.children, mark);
    return index;
  }
  reIndexMark() {
    Object.keys(this.markDict).forEach((k) => {
      this.markDict[k].idx = this.getPos(this.markDict[k].mark);
    });
  }
  addToMarkDict(mark) {
    let selectedText = mark.innerHTML.trim().toLowerCase();
    let curIdx = this.getPos(mark);
    let d = { mark: mark, idx: curIdx };
    this.markDict[selectedText] = d;
    this.reIndexMark();
  }
  getEnterObjects() {
    return this.objectDict[this.focusedText];
  }
  getUpdateObjects() {
    return this.updateDict[this.focusedText];
  }
  // set different style of the mark to indicate focus
  indicateFocus() {
    Object.keys(this.markDict).forEach((k) => {
      if (k === this.focusedText) {
        this.markDict[k].mark.classList.add("active");
      } else {
        this.markDict[k].mark.classList.remove("active");
      }
    });
    // console.log(this.markDict);
  }
  addToDict(text, obj) {
    if (this.objectDict[text]) {
      this.objectDict[text].push(obj);
      this.idDict[obj.objectId] = obj;
      //   const preobj = this.objectDict[text];
      //   this.canvas.canvas.remove(preobj.fabric);
    } else {
      this.objectDict[text] = [obj];
      this.idDict[obj.objectId] = obj;
      this.textRank[text] = this._n_marks;
      this._n_marks += 1;
    }
  }
  rerenderConfig() {
    // const container = document.getElementById("configContainer");
    // const root = createRoot(container);
    this.root.render(
      <ConfigPanel selectedText={this.focusedText} status={"enter"} />
    );
  }
  addToUpdate(text, obj) {
    console.log("add to update");
    if (this.updateDict[text]) {
      if (!this.updateDict[text].includes(obj.objectId)) {
        this.updateDict[text].push(obj.objectId);
      }
    } else {
      this.updateDict[text] = [obj.objectId];
    }
  }
  removeObject() {
    const curFocus = canvasObjects.focus;
    const curId = this.focus.objectId;
    this.focus.exitCanvas();
    // remove from obejctDict
    let newList = [];
    this.objectDict[this.focusedText].forEach((e) => {
      if (e.objectId !== curId) {
        newList.push(e);
      }
    });
    this.objectDict[this.focusedText] = newList;
    // remove from updateDict
    let newList2 = [];
    this.updatetDict[this.focusedText].forEach((e) => {
      if (e.objectId !== curId) {
        newList2.push(e);
      }
    });
    this.updateDict[this.focusedText] = newList2;
    // remove from idDict
    this.idDict.delete(curId);
  }
  enbaleAll() {
    Object.keys(this.idDict).forEach((k) => {
      this.idDict[k].fabric.set("selectable", true);
    });
  }
  setSelection(obj) {
    // same as setfocus but do not re-render config panel
    this.enbaleAll();
    if (obj) {
      if (this.focus) {
        // this.focus.moveBack();
        this.focus.deactivate();
      }
      this.focus = obj;
      this.focus.setActive();
    }
  }
  setFocus(obj) {
    this.enbaleAll();
    if (obj) {
      if (this.focus) {
        // this.focus.moveBack();
        this.focus.deactivate();
      }
      this.focus = obj;
      this.focus.setActive();
    }
    // const container = document.getElementById("configContainer");
    // const root = createRoot(container);
    this.root.render(
      <ConfigPanel selectedText={this.focusedText} status={"enter"} />
    );
  }
  // default animate all at mark
  animateAtMark() {
    const idDict = this.idDict;
    if (this.objectDict[this.focusedText]) {
      this.objectDict[this.focusedText].forEach((obj) => {
        obj.animateEnter();
      });
    }
    const curRank = this.markDict[this.focusedText].idx;
    Object.keys(this.objectDict).forEach((k) => {
      if (this.markDict[k].idx > curRank) {
        this.objectDict[k].forEach((obj) => {
          obj.disabled();
        });
      }
    });
    if (this.updateDict[this.focusedText]) {
      this.updateDict[this.focusedText].forEach((objId) => {
        idDict[objId].animateUpdate(this.focusedText);
      });
    }
  }
  setUpdateFocus() {
    // const container = document.getElementById("configContainer");
    // const root = createRoot(container);
    this.root.render(
      <ConfigPanel selectedText={this.focusedText} status={"update"} />
    );
  }
}

const canvasObjects = new CanvasObject();
const handPos = new HandPos([
  0, 2, 3, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 19, 20,
]);
const handPosArr = new HandPosArr(10);
const ws = new WebSocket("ws://localhost:8000/");
const tracker = new ScriptTracker();
const aniDriver = new AnimationDriver();

export { canvasObjects, handPos, handPosArr, ws, tracker, aniDriver };
