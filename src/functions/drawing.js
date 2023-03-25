const fingerLookupIndices = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
}; // for rendering each finger as a polyline

function drawCtx(ctx, video) {
  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
}
/**
 * Draw the keypoints on the video.
 * @param hands A list of hands to render.
 */
// function drawResults(hands, ctxt) {
//   // Sort by right to left hands.
//   hands.sort((hand1, hand2) => {
//     if (hand1.handedness < hand2.handedness) return 1;
//     if (hand1.handedness > hand2.handedness) return -1;
//     return 0;
//   });

//   // Pad hands to clear empty scatter GL plots.
//   while (hands.length < 2) hands.push({});

//   for (let i = 0; i < hands.length; ++i) {
//     // Third hand and onwards scatterGL context is set to null since we
//     // don't render them.
//     drawResult(hands[i], ctxt);
//   }
// }

// /**
//  * Draw the keypoints on the video.
//  * @param hand A hand with keypoints to render.
//  * @param ctxt Scatter GL context to render 3D keypoints to.
//  */
// function drawResult(hand, ctxt) {
//   if (hand.keypoints != null) {
//     drawKeypoints(hand.keypoints, hand.handedness);
//   }
// }

// function drawKeypoints(keypoints, handedness) {
//   const keypointsArray = keypoints;
//   this.ctx.fillStyle = handedness === "Left" ? "Red" : "Blue";
//   this.ctx.strokeStyle = "White";
//   this.ctx.lineWidth = params.DEFAULT_LINE_WIDTH;

//   for (let i = 0; i < keypointsArray.length; i++) {
//     const y = keypointsArray[i].x;
//     const x = keypointsArray[i].y;
//     drawPoint(x - 2, y - 2, 3);
//   }

//   const fingers = Object.keys(fingerLookupIndices);
//   for (let i = 0; i < fingers.length; i++) {
//     const finger = fingers[i];
//     const points = fingerLookupIndices[finger].map((idx) => keypoints[idx]);
//     drawPath(points, false);
//   }
// }

// function drawPath(points, closePath) {
//   const region = new Path2D();
//   region.moveTo(points[0].x, points[0].y);
//   for (let i = 1; i < points.length; i++) {
//     const point = points[i];
//     region.lineTo(point.x, point.y);
//   }

//   if (closePath) {
//     region.closePath();
//   }
//   this.ctx.stroke(region);
// }

// function drawPoint(y, x, r) {
//   this.ctx.beginPath();
//   this.ctx.arc(x, y, r, 0, 2 * Math.PI);
//   this.ctx.fill();
// }

export { drawCtx };
