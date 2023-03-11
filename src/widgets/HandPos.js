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
    return this.handPosVec;
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

  logPos() {
    console.log("left hand position:");
    console.log(this.left);
    console.log("right hand position:");
    console.log(this.right);
  }
}

export default HandPos;
