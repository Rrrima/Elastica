class CanvasObject {
  constructor() {
    this.canvas = null;
    this.objectDict = {};
  }
  addToDict(text, obj) {
    this.objectDict[text] = obj;
  }
}

const canvasObjects = new CanvasObject();

export { canvasObjects };
