import { HandPos, HandPosArr } from "./widgets/HandPos";

class CanvasObject {
  constructor() {
    this.canvas = null;
    this.objectDict = {};
    this.focus = null;
    this.curGesture = null;
  }
  addToDict(text, obj) {
    this.objectDict[text] = obj;
  }
  setFocus(obj) {
    this.focus = obj;
  }
}

const canvasObjects = new CanvasObject();
const handPos = new HandPos([0, 4, 8, 5, 17, 12, 16, 20]);
const handPosArr = new HandPosArr(10);
const ws = new WebSocket("ws://localhost:8000/");

export { canvasObjects, handPos, handPosArr, ws };
