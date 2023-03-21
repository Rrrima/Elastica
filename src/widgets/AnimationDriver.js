import { canvasObjects } from "../global";

export default class AnimationDriver {
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
  triggerPreview(obj) {
    // preview is triggered for certain object
    let curObj = canvasObjects.focus;
    // const curText = canvasObjects.focusedText;
    // let effect = null;
    // let status = "enter";
    // let handed = "left";
    // // get status
    // if (curObj.relatedText !== curText) {
    //   status = "update";
    // }
    // if (status === "enter") {
    //   effect = curObj.enterSetting.effect;
    //   handed = curObj.enterSetting.handed;
    // } else {
    //   effect = curObj.updates[curText].setting.effect;
    //   handed = curObj.updates[curText].setting.handed;
    // }
    if (canvasObjects.canmeraOn) {
      canvasObjects.endCustomization();
      curObj.detectIntentionality();
    } else {
      canvasObjects.animateAtMark();
    }
  }
  backtoPosition() {
    if (!canvasObjects.canmeraOn) {
      console.log("back");
    }
  }
}
