import { canvasObjects } from "../global";

export default class AnimationDriver {
  constructor() {
    this.activeObjects = [];
  }
  triggerAnimation(k) {
    // trigger animation at certain keywords -- highlighted word
    const curText = k.trim().toLowerCase();
    document.querySelector("#infobox").innerHTML = curText;
    canvasObjects.focusedText = curText;
    // if canmera not on
    if (!canvasObjects.canmeraOn) {
      canvasObjects.animateAtMark(); // not only positi
    } else {
      this.activeObjects = [];
      if (canvasObjects.objectDict[curText]) {
        canvasObjects.objectDict[curText].forEach((obj) => {
          obj.getTimeThred();
          this.activeObjects.push(obj);
        });
      }
      if (canvasObjects.updateDict[curText]) {
        canvasObjects.updateDict[curText].forEach((objid) => {
          canvasObjects.idDict[objid].getTimeThred();
          this.activeObjects.push(canvasObjects.idDict[objid]);
        });
      }
      this.preview();
    }
  }
  preview() {
    // canvasObjects.endCustomization();
    // console.log("preview", this.activeObjects);
    this.activeObjects.forEach((curObj) => {
      if (canvasObjects.canmeraOn && canvasObjects.adaptationMode) {
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
  forceEnd(k) {
    document.querySelector("#infobox").innerHTML = "";
    const curText = k.trim().toLowerCase();
    if (canvasObjects.objectDict[curText]) {
      canvasObjects.objectDict[curText].forEach((obj) => {
        obj.afterEnter();
      });
    }
    if (canvasObjects.updateDict[curText]) {
      canvasObjects.updateDict[curText].forEach((objid) => {
        canvasObjects.idDict[objid].afterUpdate(curText);
      });
    }
  }
}
