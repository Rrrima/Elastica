import { canvasObjects } from "../global";

export default class AnimationDriver {
  constructor() {
    this.activeObjects = [];
  }
  triggerAnimation(k) {
    // trigger animation at certain keywords -- highlighted word
    const curText = k.trim().toLowerCase();
    canvasObjects.focusedText = curText;
    // if canmera not on
    if (!canvasObjects.canmeraOn) {
      canvasObjects.animateAtMark(); // not only positi
    } else {
      // if camera on -- adaptation
    }
  }
  triggerPreviewAll() {
    console.log(this);
    this.activeObjects = [];
    const curText = canvasObjects.focusedText;
    canvasObjects.objectDict[curText].forEach((obj) => {
      this.activeObjects.push(obj);
    });
    canvasObjects.updateDict[curText].forEach((objid) => {
      this.activeObjects.push(canvasObjects.idDict[objid]);
    });
    this.preview();
  }
  triggerPreview() {
    // preview is triggered for focused object
    this.activeObjects = [canvasObjects.focus];
    this.preview();
  }
  preview() {
    canvasObjects.endCustomization();
    this.activeObjects.forEach((curObj) => {
      if (canvasObjects.canmeraOn) {
        curObj.revert();
        curObj.detectIntentionality();
      } else {
        curObj.animateAtMark();
      }
    });
  }
  backtoPosition() {
    if (!canvasObjects.canmeraOn) {
      console.log("back");
    }
  }
}
