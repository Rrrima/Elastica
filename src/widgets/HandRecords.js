import { canvasObjects, handPos } from "../global";
import { euclideanDistance, isValid, normalizeSumOne, sumArray } from "./utils";
import { gaussianRBF, hasNan } from "./utils";
import { C } from "../global";
export default class HandRecords {
  constructor() {
    this.record = {};
  }
  isrecorded(t) {
    // return true;
    if (!this.record[t]) {
      return false;
    } else if (this.record[t].length === 0) {
      return false;
    } else {
      return true;
    }
  }
  clear() {
    const rkey = canvasObjects.focusedText;
    delete this.record[rkey];
  }
  addToRecord() {
    const rkey = canvasObjects.focusedText;
    const r = {};
    r.objAttr = canvasObjects.focus.getCurrentAttr();
    console.log(r.objAttr);
    if (rkey === canvasObjects.focus.relatedText) {
      r.handed = canvasObjects.focus.enterSetting.handed;
    } else {
      r.handed = canvasObjects.focus.updates[rkey].setting.handed;
    }
    r.handPosVec = handPos.handPosVec[r.handed];
    r.handCenter = handPos.handCenterVec[r.handed];
    r.offsets = [
      r.objAttr.left - r.handCenter[0],
      r.objAttr.top - r.handCenter[1],
    ];
    if (this.record[rkey]) {
      this.record[rkey].push(r);
    } else {
      this.record[rkey] = [r];
    }
    canvasObjects.indicateColor = "red";
    setTimeout(() => {
      canvasObjects.indicateColor = "#52efbb";
    }, 300);
    canvasObjects.rerenderConfig();
  }
  getSimilarity(handed) {
    const rkey = canvasObjects.focusedText;
    const records = this.record[rkey];
    const dist = [];
    records.forEach((r) => {
      if (r.handed === handed) {
        let v1 = r.handPosVec;
        let v2 = handPos.handPosVec[handed];
        dist.push(euclideanDistance(v1, v2));
      }
    });

    if (hasNan(dist)) {
      return;
    }
    // console.log(dist);
    const sim = dist.map((d) =>
      d > C.sim.b ? gaussianRBF(C.sim.eps, d - C.sim.b) : 1
    );
    return sim;
  }
  getWeights(handed) {
    const sim = this.getSimilarity(handed);
    return normalizeSumOne(sim);
  }
  getParams(handed) {
    const rkey = canvasObjects.focusedText;
    const records = this.record[rkey];
    const w = this.getWeights(handed);
    let j = 0;
    let pm = { dl: 0, dt: 0, sx: 0, sy: 0, da: 0 };
    if (w && w[0]) {
      records.forEach((r, i) => {
        if (r.handed === handed) {
          pm.dl += w[j] * r.offsets[0];
          pm.dt += w[j] * r.offsets[1];
          pm.sx += w[j] * r.objAttr.scaleX;
          pm.sy += w[j] * r.objAttr.scaleY;
          pm.da += w[j] * r.objAttr.angle;
          j += 1;
        }
      });
      return pm;
    } else {
      return;
    }
  }
}
