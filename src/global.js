import { HandPos, HandPosArr } from "./widgets/HandPos";
import { createRoot } from "react-dom/client";
import ConfigPanel from "./mainPanels/ConfigPanel";
import { fabric } from "fabric";
import gsap from "gsap";
import ScriptTracker from "./widgets/ScriptTracker";
import AnimationDriver from "./widgets/AnimationDriver";

function handleCustomization(event) {
  const curObj = canvasObjects.focus;
  if (event.key === "r") {
    curObj.handRecord.addToRecord();
  }
}

class CanvasObject {
  constructor() {
    this.canvas = null; // == editor
    this.canvasWidth = 1000;
    this.canvasHeight = null;
    this.objectDict = {}; // selectedText -> [obj,obj]
    this.updateDict = {}; // selectedText -> [objid,objid]
    this.idDict = {};
    this.mode = "editing";
    this.presentationMode = false;
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
    this.customizeMode = false;
    this.handed = "left";
    this.initializeIndicator("left");
    this.initializeIndicator("right");
    //   createRoots() {
    //     console.log("create root");
    //     const container = document.getElementById("configContainer");
    //     const root = createRoot(container);
    //     this.roots = { configRoot: root };
    //   }
  }
  startPresentation() {
    document.querySelector("#visual-panel").style.filter =
      "drop-shadow(1px 2px 8px #52efbb";
    this.mode = "presentation";
    Object.keys(this.idDict).forEach((k) => {
      this.idDict[k].getReady();
    });
    if (this.canmeraOn) {
      this.removeHand("both");
      this.addHandToScene("both");
      this.indicateColor = "grey";
    } else {
      document.querySelector("#infobox").innerHTML = "please open camera";
      setTimeout(() => {
        document.querySelector("#infobox").innerHTML = "";
      }, 1500);
    }
    document.querySelector("#visual-panel").style.filter =
      "drop-shadow(1px 2px 8px #52efbb";
  }
  endPresentation() {
    document.querySelector("#visual-panel").style.filter =
      "drop-shadow(1px 2px 8px hsl(0deg 0% 0% / 0.1)";
    this.mode = "editing";
    if (this.canmeraOn) {
      this.removeHand("both");
    }
  }

  startPreview() {
    console.log(" =====  start preview: =====");
    console.log(aniDriver.activeObjects);
    this.removeHand("both");
    this.addHandToScene("both");
    this.mode = "preview";
    this.indicateColor = "blue";
    document.querySelector("#visual-panel").style.border = "3px solid #ffa9ab";
    // document.querySelector("#visual-panel").style.filter =
    //   "drop-shadow(1px 2px 8px #52efbb";
    //  filter: drop-shadow(1px 2px 8px var(--shadow-color));
  }

  endPreview() {
    console.log(" =====  end preview: =====");
    this.removeHand("both");
    this.mode = "editing";
    document.querySelector("#visual-panel").style.border = "";
    // document.querySelector("#visual-panel").style.filter =
    //   "drop-shadow(1px 2px 8px hsl(0deg 0% 0% / 0.1)";
    // if (this.customizeMode) {
    //   document.querySelector("#visual-panel").style.border =
    //     "3px solid #52efbb";
    //   this.indicateColor = "#52efbb";
    // }
    aniDriver.forceEnd(canvasObjects.focusedText);
  }

  startCustomization(handed) {
    this.removeHand("both");
    this.addHandToScene(handed);
    this.indicateColor = "#52efbb";
    console.log("customization started");
    // this.hideHand();
    // this.showHand(handed);
    this.customizeMode = true;
    document.addEventListener("keydown", handleCustomization);
    // console.log(document.querySelector("#visual-panel").style);
    document.querySelector("#visual-panel").style.border = "3px solid #52efbb";
    this.rerenderConfig();
  }
  endCustomization() {
    // this.recoverHand();
    this.customizeMode = false;
    this.indicateColor = "blue";
    document.removeEventListener("keydown", handleCustomization);
    document.querySelector("#visual-panel").style.border = "";
    this.removeHand("both");
    this.rerenderConfig();
  }

  initializeIndicator(handed) {
    // add fabric object to dictionary, only all once
    // when you first open the de
    console.log(handed + " is initialized");
    this.allFingers.forEach((f) => {
      this.handIndicators[handed][f] = new fabric.Circle({
        radius: 6,
        fill: "blue",
        left: 0,
        top: 0,
        opacity: 0,
      });
    });
  }

  addHandToScene(handed) {
    console.log(handed + " is aded to scene");
    let handliist = [handed];
    if (handed === "both") {
      handliist = ["left", "right"];
    } else if (handed === "none") {
      handliist = [];
    }
    handliist.forEach((handed) => {
      this.allFingers.forEach((f) => {
        this.canvas.canvas.add(this.handIndicators[handed][f]);
      });
    });
    this.canvas.canvas.renderAll();
  }

  removeHand(handed) {
    console.log(handed + " hand is removed from canvass");
    let handliist = [handed];
    if (handed === "both") {
      handliist = ["left", "right"];
    }
    handliist.forEach((handed) => {
      if (this.handIndicators[handed]) {
        this.allFingers.forEach((f) => {
          this.handIndicators[handed][f].set("opacity", 0);
          if (this.handIndicators[handed][f]) {
            this.canvas.canvas.remove(this.handIndicators[handed][f]);
          }
        });
      }
    });
    this.canvas.canvas.renderAll();
  }

  showHand(handed) {
    if (handed === "both") {
      this.visHand("left");
      this.visHand("right");
    } else {
      this.visHand(handed);
    }
  }

  visHand(handed) {
    const ftPos = handPos.getFingertipPos(handed, "all");
    const fill = this.indicateColor;
    // console.log("vishand:" + handed);
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
      // console.log("not detected");
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
  getPreviousKey(keys) {
    let mdist = 999;
    let findK = null;
    const markDict = this.markDict;
    const curRank = markDict[this.focusedText].idx;
    keys.forEach((k) => {
      if (markDict[k].idx < curRank && mdist > curRank - markDict[k].idx) {
        findK = k;
        mdist = curRank - markDict[k].idx;
      }
    });
    return findK;
  }
  addToUpdate(text, obj) {
    if (this.updateDict[text]) {
      if (!this.updateDict[text].includes(obj.objectId)) {
        this.updateDict[text].push(obj.objectId);
      }
    } else {
      this.updateDict[text] = [obj.objectId];
    }
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
const handPosArr = new HandPosArr(8);
const ws = new WebSocket("ws://localhost:8000/");
const tracker = new ScriptTracker();
const aniDriver = new AnimationDriver();
const C = {
  sim: { eps: 1.5, b: 0.45, thred: 0.7 },
  handStatic: { eps: 0.5, b: 6, thred: 0.99 },
  time: { duration: 1200, step: 50 },
  ada: { gaussian: { eps: 3, b: 0.5 } },
};

export { canvasObjects, handPos, handPosArr, ws, tracker, aniDriver, C };
