class CanvasObject {
  constructor() {
    this.canvas = null;
    this.objectDict = {};
    this.focus = null;
  }
  addToDict(text, obj) {
    this.objectDict[text] = obj;
  }
  setFocus(obj) {
    this.focus = obj;
  }
}

const canvasObjects = new CanvasObject();

export { canvasObjects };
