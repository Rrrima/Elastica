import * as math from "mathjs";

function angleBetweenVectors(v1, v2) {
  const dotProduct = v1.x * v2.x + v1.y * v2.y;
  const magV1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const magV2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  const angleInRadians = Math.acos(dotProduct / (magV1 * magV2));
  const angleInDegrees = (angleInRadians * 180) / Math.PI;
  return angleInDegrees;
}

function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

function normalizeVector(vector) {
  const vec = vector.map((component) => component - 1 / 2);
  const r = sumArray(vec);
  return vec.map((v) => v / r);
}

class HandPos {
  constructor(index) {
    this.index = index;
    this.left = {};
    this.right = {};
    this.left3d = {};
    this.right3d = {};
    this.detection = null;
    this.isDetected = { either: false, right: false, left: false };
    this.handPosVec = null;
    this.handCenterVec = null;
    this.initPos();
    this.hands = null;
    this.allFingers = ["thumb", "index", "middle", "ring", "pinky"];
    this.fingerMap = {
      thumb: [0, 2, 4],
      index: [5, 6, 8],
      middle: [9, 10, 12],
      ring: [13, 14, 16],
      pinky: [17, 19, 20],
    };
  }

  getFingertipPos(handed, fingerNames) {
    let res = {};
    if (fingerNames === "all") {
      fingerNames = this.allFingers;
    }
    fingerNames.forEach((fingerName) => {
      let idx = this.fingerMap[fingerName][2];
      if (handed === "left") {
        res[fingerName] = this.left[idx];
      } else if (handed === "right") {
        res[fingerName] = this.right[idx];
      }
    });
    return res;
  }

  initPos() {
    this.index.forEach((i) => {
      this.right[i] = [null, null, null];
      this.right3d[i] = [null, null, null];
      this.left[i] = [null, null, null];
      this.left3d[i] = [null, null, null];
    });
    this.isDetected.either = false;
    this.isDetected.left = false;
    this.isDetected.right = false;
  }

  updatePosition(pred) {
    this.hands = pred;
    this.initPos();
    if (pred.length > 0) {
      this.isDetected.either = true;
      pred.forEach((p) => {
        this.index.forEach((i) => {
          let t = p.keypoints[i];
          let t3 = p.keypoints3D[i];
          if (p.handedness === "Right") {
            this.isDetected.right = true;
            this.right[i] = [t.x, t.y, t3.z];
            this.right3d[i] = [t3.x, t3.y, t3.z];
          } else if (p.handedness === "Left") {
            this.isDetected.left = true;
            this.left[i] = [t.x, t.y, t3.z];
            this.left3d[i] = [t3.x, t3.y, t3.z];
          }
        });
      });
      this.detection = { left: this.left, right: this.right };
    } else {
      this.detection = { left: this.left, right: this.right };
    }
    this.handPosVec = this.get3dVector();
    this.handCenterVec = this.getHandCenters();
    return [this.handPosVec, this.handCenterVec];
  }

  getAngle(handed, fingerName) {
    const ptIndx = this.fingerMap[fingerName];
    let hand3d = null;
    if (handed === "left") {
      hand3d = this.left3d;
    } else if (handed === "right") {
      hand3d = this.right3d;
    }
    if (this.isDetected[handed]) {
      // console.log(ptIndx);
      // const p0 = hand3d[0];
      const p1 = hand3d[ptIndx[0]];
      const p2 = hand3d[ptIndx[1]];
      const p3 = hand3d[ptIndx[2]];
      const v1 = { x: p3[0] - p2[0], y: p3[1] - p2[1] };
      const v2 = { x: p1[0] - p2[0], y: p1[1] - p2[1] };
      // const v3 = { x: p0[0] - p1[0], y: p0[1] - p1[1] };
      // const v4 = { x: p2[0] - p1[0], y: p2[1] - p1[1] };
      const angle = (angleBetweenVectors(v1, v2) - 90) / 90;
      // const angleOut = (angleBetweenVectors(v3, v4) - 90) / 90;
      return angle;
    } else {
      return;
    }
  }

  getHandAngle(handed) {
    const vec = [
      this.getAngle(handed, "thumb"),
      this.getAngle(handed, "index"),
      this.getAngle(handed, "middle"),
      this.getAngle(handed, "ring"),
      this.getAngle(handed, "pinky"),
    ];
    return normalizeVector(vec);
  }

  getVisHandAngle(handed) {
    const vec = [
      this.getAngle(handed, "thumb"),
      this.getAngle(handed, "index"),
      this.getAngle(handed, "middle"),
      this.getAngle(handed, "ring"),
      this.getAngle(handed, "pinky"),
    ];
    const ftAng = normalizeVector(vec);
    const r = Math.max(...ftAng);
    return ftAng.map((v) => v / r);
  }

  get3dVector() {
    let leftVec = [];
    let rightVec = [];
    this.index.forEach((i) => {
      leftVec.push(...this.left3d[i]);
      rightVec.push(...this.right3d[i]);
    });
    return { left: leftVec, right: rightVec };
  }

  getHandCenters() {
    let xleft = null;
    let yleft = null;
    let xright = null;
    let yright = null;

    if (this.left[0] && this.left[0][0]) {
      xleft = math.mean([0, 5, 17].map((i) => this.left[i][0]));
      yleft = math.mean([0, 5, 17].map((i) => this.left[i][1]));
    }
    if (this.right[0] && this.right[0][0]) {
      xright = math.mean([0, 5, 17].map((i) => this.right[i][0]));
      yright = math.mean([0, 5, 17].map((i) => this.right[i][1]));
    }
    return { left: [xleft, yleft], right: [xright, yright] };
  }

  getAnimationParams(g, handed, r, offSets, dim) {
    if (g === "pointing") {
      if (handed === "left") {
        let pos = this.left[8];
        return {
          left: pos[0] * r + offSets[0],
          top: pos[1] * r + offSets[1],
          scaleY: 1,
        };
      } else if (handed === "right") {
        let pos = this.right[8];
        return {
          left: pos[0] * r + offSets[0],
          top: pos[1] * r + offSets[1],
          scaleY: 1,
        };
      }
    } else if (g === "staging") {
      let pos = this.handCenterVec[handed];
      return {
        left: pos[0] * r + offSets[0],
        top: pos[1] * r + offSets[1],
        scaleY: 1,
      };
    } else if (g === "pinch") {
      let params = this.getPinchHandDim(handed);
      let pos = params.pos;
      return {
        left: pos[0] * r + offSets[0],
        top: pos[1] * r + offSets[1],
        scaleY: params.height / dim.height,
      };
    }
  }

  getPinchHandDim(handed) {
    // if handed is left/right, pos, and
    let height,
      pIndex,
      pThumb,
      width,
      pos = null;
    if (handed === "both") {
      let pIndex1 = this.left[8];
      let pThumb1 = this.left[4];
      let height1 = Math.abs(pIndex1[1] - pThumb1[1]);
      let pIndex2 = this.right[8];
      let pThumb2 = this.right[4];
      let height2 = Math.abs(pIndex2[1] - pThumb2[1]);
      let width1 = Math.abs(pIndex1[0] - pIndex2[0]);
      let width2 = Math.abs(pThumb1[0] - pThumb2[0]);
      width = (width1 + width2) / 2;
      height = (height1 + height2) / 2;
      // TODO: change the method of calculating pos
      let posX = (pIndex1[0] + pThumb1[0]) / 2 + width / 2;
      let posY = (pIndex1[1] + pIndex2[1]) / 2 + height / 2;
      pos = [posX, posY];
    } else {
      if (handed === "left") {
        pIndex = this.left[8];
        pThumb = this.left[4];
      } else if (handed === "right") {
        pIndex = this.right[8];
        pThumb = this.right[4];
      }
      height = Math.abs(pIndex[1] - pThumb[1]);
      pos = [(pIndex[0] + pThumb[0]) / 2, (pIndex[1] + pThumb[1]) / 2];
    }
    return { pos: pos, height: height, width: width };
  }

  logPos() {
    console.log("left hand position:");
    console.log(this.left);
    console.log("right hand position:");
    console.log(this.right);
  }
}

class HandPosArr {
  constructor(length) {
    this.arrLen = length;
    this.arrLeft = [];
    this.arrRight = [];
    this.arrCenterLeft = [];
    this.arrCenterRight = [];
  }
  clearArr() {
    this.allpos = [];
  }
  updateHandArr(posVec, centerVec) {
    let leftVec = posVec.left;
    let rightVec = posVec.right;
    this.arrLeft.push(leftVec);
    this.arrRight.push(rightVec);
    this.arrCenterLeft.push(centerVec.left);
    this.arrCenterRight.push(centerVec.right);
    if (this.arrLeft.length > this.arrLen) {
      // always store the last arrLen
      this.arrLeft.shift();
      this.arrRight.shift();
      this.arrCenterLeft.shift();
      this.arrCenterRight.shift();
    }
  }
}

export { HandPos, HandPosArr };
