import * as math from "mathjs";

class HandPos {
  constructor(index) {
    this.index = index;
    this.left = {};
    this.right = {};
    this.left3d = {};
    this.right3d = {};
    this.detection = null;
    this.handPosVec = null;
    this.handCenterVec = null;
    this.initPos();
    this.hands = null;
  }
  initPos() {
    this.index.forEach((i) => {
      this.right[i] = [null, null, null];
      this.right3d[i] = [null, null, null];
      this.left[i] = [null, null, null];
      this.left3d[i] = [null, null, null];
    });
  }

  updatePosition(pred) {
    this.hands = pred;
    this.initPos();
    if (pred.length > 0) {
      pred.forEach((p) => {
        this.index.forEach((i) => {
          let t = p.keypoints[i];
          let t3 = p.keypoints3D[i];
          if (p.handedness === "Right") {
            this.right[i] = [t.x, t.y, t3.z];
            this.right3d[i] = [t3.x, t3.y, t3.z];
          } else if (p.handedness === "Left") {
            this.left[i] = [t.x, t.y, t3.z];
            this.left3d[i] = [t3.x, t3.y, t3.z];
          }
        });
      });
      this.detection = { left: this.left, right: this.right };
    }
    this.handPosVec = this.get3dVector();
    this.handCenterVec = this.getHandCenters();
    return [this.handPosVec, this.handCenterVec];
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
