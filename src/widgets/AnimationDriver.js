import { canvasObjects } from "../global";

export default class AnimationDriver {
  triggerAnimation(k) {
    console.log(k);
    const curText = k.trim().toLowerCase();
    canvasObjects.focusedText = curText;
    if (!canvasObjects.canmeraOn) {
      canvasObjects.animateAtMark();
    }
  }
  backtoPosition() {
    if (!canvasObjects.canmeraOn) {
      console.log("back");
    }
  }
}
