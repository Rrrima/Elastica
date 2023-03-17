import { HandPos, HandPosArr } from "./widgets/HandPos";
import { createRoot } from "react-dom/client";
import ConfigPanel from "./mainPanels/ConfigPanel";
class CanvasObject {
  constructor() {
    this.canvas = null; // == editor
    this.objectDict = {}; // selectedText -> [obj,obj]
    this.updateDict = {}; // selctedText -> [obj,obj]
    this.idDict = {};
    this.textRank = {};
    this._n_marks = 0;
    this.focus = null;
    this.focusedText = null;
    this.curGesture = null;
  }
  //   createRoots() {
  //     console.log("create root");
  //     const container = document.getElementById("configContainer");
  //     const root = createRoot(container);
  //     this.roots = { configRoot: root };
  //   }
  getEnterObjects() {
    return this.objectDict[this.focusedText];
  }
  getUpdateObjects() {
    return this.updateDict[this.focusedText];
  }
  indicateFocus() {
    const updates = this.updateDict[this.focusedText];
    const enters = this.objectDict[this.focusedText];
    console.log(updates);
    console.log(enters);
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
    const container = document.getElementById("configContainer");
    const root = createRoot(container);
    root.render(
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
  removeObject() {}
  removeUpdate(text, obj) {}
  enbaleAll() {
    console.log(Object.keys(this.idDict));
    Object.keys(this.idDict).forEach((k) => {
      this.idDict[k].fabric.set("selectable", true);
    });
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
    const container = document.getElementById("configContainer");
    const root = createRoot(container);
    root.render(
      <ConfigPanel selectedText={this.focusedText} status={"enter"} />
    );
    const idDict = this.idDict;
    this.objectDict[this.focusedText].forEach((obj) => {
      obj.animateEnter();
    });
    const curRank = this.textRank[this.focusedText];
    Object.keys(this.objectDict).forEach((k) => {
      if (this.textRank[k] > curRank) {
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
    const container = document.getElementById("configContainer");
    const root = createRoot(container);
    root.render(
      <ConfigPanel selectedText={this.focusedText} status={"update"} />
    );
  }
}

const canvasObjects = new CanvasObject();
const handPos = new HandPos([0, 4, 8, 5, 17, 12, 16, 20]);
const handPosArr = new HandPosArr(10);
const ws = new WebSocket("ws://localhost:8000/");

export { canvasObjects, handPos, handPosArr, ws };
