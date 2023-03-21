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
      const curObj = canvasObjects.focus;
      const curText = canvasObjects.focusedText;
      let effect = null;
      let status = "enter";
      if (curObj.relatedText !== curText) {
        status = "update";
      }
      if (status === "enter") {
        effect = curObj.enterSetting.effect;
      } else {
        effect = curObj.updates[curText].setting.effect;
      }
      if (canvasObjects.canmeraOn) {
        if (curObj.enterSetting.customize) {
          c;
        } else {
          curObj.enterWithHand(effect);
          setTimeout(() => {
            curObj.endEnterWithHand(effect);
          }, 1500);
        }
      } else {
        canvasObjects.animateAtMark();
      }
    }
  }
  triggerAuthoring() {}
  backtoPosition() {
    if (!canvasObjects.canmeraOn) {
      console.log("back");
    }
  }
}
