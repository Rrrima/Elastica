import { canvasObjects, handPos } from "../global";
import { euclideanDistance, normalizeSumOne, sumArray } from "./utils";
import { gaussianRBF } from "./utils";
import { C } from "../global";
export default class HandRecords {
  constructor() {
    this.record = {};
  }
  addToRecord() {
    const rkey = canvasObjects.focusedText;
    const r = {};
    r.objAttr = canvasObjects.focus.getCurrentAttr();
    r.handed = canvasObjects.handed;
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
      canvasObjects.indicateColor = "blue";
    }, 300);
  }
  getSimilarity() {
    const rkey = canvasObjects.focusedText;
    const records = this.record[rkey];
    const dist = [];
    records.forEach((r) => {
      let v1 = r.handPosVec;
      let v2 = handPos.handPosVec[r.handed];
      dist.push(euclideanDistance(v1, v2));
    });
    // console.log(dist);
    const sim = dist.map((d) =>
      d > C.sim.b ? gaussianRBF(C.sim.eps, d - C.sim.b) : 1
    );
    return sim;
  }
  getWeights() {
    const sim = this.getSimilarity();
    return normalizeSumOne(sim);
  }
  getParams() {
    const rkey = canvasObjects.focusedText;
    const records = this.record[rkey];
    const w = this.getWeights();
    let pm = { dl: 0, dt: 0, sx: 0, sy: 0 };
    if (w[0]) {
      records.forEach((r, i) => {
        pm.dl += w[i] * r.offsets[0];
        pm.dt += w[i] * r.offsets[1];
        pm.sx += w[i] * r.objAttr.scaleX;
        pm.sy += w[i] * r.objAttr.scaleY;
      });
      return pm;
    } else {
      return;
    }
  }
}
