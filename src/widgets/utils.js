function angleBetweenVectors(v1, v2) {
  const dotProduct = v1.x * v2.x + v1.y * v2.y;
  const magV1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const magV2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  const angleInRadians = Math.acos(dotProduct / (magV1 * magV2));
  const angleInDegrees = (angleInRadians * 180) / Math.PI;
  return angleInDegrees;
}

function getIndexOfMinElement(arr) {
  const min = Math.min(...arr);
  return arr.indexOf(min);
}

function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

function euclideanDistance(A, B) {
  let sumOfSquares = 0;
  for (let i = 0; i < A.length; i++) {
    sumOfSquares += (A[i] - B[i]) ** 2;
  }
  return Math.sqrt(sumOfSquares);
}

function normalizeVector(vector) {
  const vec = vector.map((component) => component - 1 / 2);
  //   const r = sumArray(vec);
  //   return vec.map((v) => v / r);
  return vec;
}

function calculateAvgDistance(arr) {
  let totalDis = 0;
  let n = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i][0] && arr[i + 1][0]) {
      n += 1;
      totalDis += euclideanDistance(arr[i], arr[i + 1]);
    }
  }
  if (n > 0) {
    return totalDis / n;
  } else {
    return 999;
  }
}

function distPenalty(xg, xf, t) {
  return 1 / (1 + Math.pow(t, 2) * Math.pow(xg - xf, 2));
}

function gaussianBlending(xg, xf, t) {
  let w = Math.exp(-Math.pow(0.04 * t, 2));
  if (t > 30) {
    w = distPenalty(xg, xf, t) * w;
  }
  console.log(w);
  return w * xg + (1 - w) * xf;
}

function bumpBlending(xg, xf, t) {
  let eps = 14;
  let w;
  if (t < eps) {
    if (t > 0.9 * eps) {
      w =
        distPenalty(xg, xf, t) *
        Math.exp(-1 / (1 - Math.pow(t / eps, 2))) *
        Math.E;
    } else {
      w = Math.exp(-1 / (1 - Math.pow(t / eps, 2))) * Math.E;
    }
  } else {
    w = 0;
  }
  return w * xg + (1 - w) * xf;
}

function gaussianRBF(eps, r) {
  return Math.exp(-Math.pow(eps * r, 2));
}

function entropy(arr) {
  let entropy = 0;
  const length = arr.length;
  for (let i = 0; i < length; i++) {
    const p = arr[i];
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}

function normalizeSumOne(weights) {
  const sum = weights.reduce((acc, val) => acc + val, 0);
  return weights.map((val) => val / sum);
}

export {
  euclideanDistance,
  angleBetweenVectors,
  sumArray,
  normalizeVector,
  calculateAvgDistance,
  getIndexOfMinElement,
  gaussianRBF,
  entropy,
  normalizeSumOne,
};
