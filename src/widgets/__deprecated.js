// function keyframeExtractor(e) {
//   const attrNames = [
//     "scaleX",
//     "scaleY",
//     "top",
//     "left",
//     "opacity",
//     "dynamicMinWidth",
//     "height",
//   ];
//   const target = e.target;
//   let k = {};
//   for (let i = 0; i < attrNames.length; i++) {
//     k[attrNames[i]] = target[attrNames[i]];
//   }
//   return k;
// }

// import * as React from "react";
// import IconButton from "@mui/material/IconButton";
// import Stack from "@mui/material/Stack";
// import VideocamIcon from "@mui/icons-material/Videocam";
// // import MicIcon from "@mui/icons-material/Mic";
// import Webcam from "react-webcam";
// import { drawCtx } from "../functions/drawing";
// import AutoGraphIcon from "@mui/icons-material/AutoGraph";
// import { FabricJSCanvas } from "fabricjs-react";
// import { useRef, useEffect, useState } from "react";
// import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
// import * as tf from "@tensorflow/tfjs";
// import Stitch from "../resources/Images/stitch.png";
// import "@tensorflow/tfjs-backend-webgl";
// import {
//   canvasObjects,
//   handPos,
//   handPosArr,
//   ws,
//   handRecord,
//   aniDriver,
// } from "../global";
// import SpeechRecognition, {
//   useSpeechRecognition,
// } from "react-speech-recognition";
// import { tracker } from "../global";
// // import { DH } from "../dummyHand";
// import * as tfjsWasm from "@tensorflow/tfjs-backend-wasm";

// // tfjsWasm.setWasmPaths(
// //   `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
// // );

// const VisualPanel = React.forwardRef((props, ref) => {
//   // const { editor, onReady } = useFabricJSEditor();
//   const [previewMode, setMode] = useState(false);
//   const [scriptFollowing, setScriptFollowing] = useState(false);
//   const editor = props.editor;
//   const onReady = props.onReady;
//   const webcamRef = useRef(null);
//   const handCanvasRef = useRef(null);
//   let handposeDetector = null;
//   let gNumWordsInScript = 0;
//   let r = 1;
//   let xx = 0;
//   let detectIdle = true;
//   let rafId;
//   let startInferenceTime,
//     numInferences = 0;
//   let inferenceTimeSum = 0,
//     lastPanelUpdate = 0;
//   canvasObjects.canvas = editor;

//   var { transcript, resetTranscript } = useSpeechRecognition({});

//   function generateSpan(inToken, inIndex) {
//     return '<span id="' + inIndex + '">' + inToken + " </span>";
//   }

//   function populateScript(inString) {
//     // Sending the script when populated by default (python server should be connected)
//     ws.send(
//       JSON.stringify({
//         name: "populateScript",
//         params: { referenceScript: inString },
//       })
//     );
//     // split into tokens
//     const tokens = inString.split(/\s+/);
//     // generate spans
//     let htmlString = "";
//     let index = 0;
//     for (const token of tokens) {
//       if (token.toLowerCase().match(/[^_\W]+/g)) {
//         //
//         htmlString += generateSpan(token, index);
//         index++;
//       }
//     }

//     gNumWordsInScript = index;
//     console.log("Number of words in the script", gNumWordsInScript);

//     // const tpScript = document.getElementById("teleprompter-script");
//     // tpScript.innerHTML = htmlString;
//   }

//   if (scriptFollowing && transcript) {
//     ws.send(
//       JSON.stringify({
//         name: "scriptFollowing",
//         params: { transcript: transcript },
//       })
//     );
//   }

//   const handleChangeMode = () => {
//     canvasObjects.removeHand("both");
//     setMode(!previewMode);
//     canvasObjects.canmeraOn = !canvasObjects.canmeraOn;
//     if (previewMode) {
//       canvasObjects.removeHand();
//     }
//   };

//   const handleChangeScriptFollowing = () => {
//     setScriptFollowing(!scriptFollowing);
//     if (!scriptFollowing) {
//       canvasObjects.startPresentation();
//       canvasObjects.textEditor.current.editor.save().then((data) => {
//         let currentScript = data.blocks[0].data.text;
//         populateScript(currentScript);
//       });
//       SpeechRecognition.startListening({ continuous: true });
//     } else {
//       tracker.revertQ();
//       resetTranscript();
//       SpeechRecognition.abortListening();
//       canvasObjects.endPresentation();
//       ws.send(
//         JSON.stringify({
//           name: "transcriptionComplete",
//           params: {},
//         })
//       );
//     }
//   };

//   function beginEstimateHandsStats() {
//     startInferenceTime = (performance || Date).now();
//   }

//   function endEstimateHandsStats() {
//     const endInferenceTime = (performance || Date).now();
//     inferenceTimeSum += endInferenceTime - startInferenceTime;
//     ++numInferences;

//     const panelUpdateMilliseconds = 1000;
//     if (endInferenceTime - lastPanelUpdate >= panelUpdateMilliseconds) {
//       const averageInferenceTime = inferenceTimeSum / numInferences;
//       inferenceTimeSum = 0;
//       numInferences = 0;
//       console.log(averageInferenceTime);
//       // stats.customFpsPanel.update(
//       //   1000.0 / averageInferenceTime,
//       //   120 /* maxValue */
//       // );
//       lastPanelUpdate = endInferenceTime;
//     }
//   }

//   // async function renderResult() {
//   //   let video;
//   //   if (
//   //     typeof webcamRef.current !== "undefined" &&
//   //     webcamRef.current !== null &&
//   //     webcamRef.current.video.readyState === 4
//   //   ) {
//   //     // get video properties
//   //     video = webcamRef.current.video;
//   //   }

//   //   let hands = null;

//   //   // Detector can be null if initialization failed (for example when loading
//   //   // from a URL that does not exist).
//   //   if (handposeDetector != null) {
//   //     // FPS only counts the time it takes to finish estimateHands.
//   //     beginEstimateHandsStats();

//   //     // Detectors can throw errors, for example when using custom URLs that
//   //     // contain a model that doesn't provide the expected output.
//   //     try {
//   //       hands = await handposeDetector.estimateHands(video, {
//   //         flipHorizontal: true,
//   //       });
//   //       console.log(hands);
//   //     } catch (error) {
//   //       handposeDetector.dispose();
//   //       handposeDetector = null;
//   //       alert(error);
//   //     }

//   //     endEstimateHandsStats();
//   //   }
//   // }

//   async function renderPrediction() {
//     beginEstimateHandsStats();
//     // await checkGuiUpdate();
//     // await renderResult();
//     await detect(handposeDetector);
//     endEstimateHandsStats();

//     rafId = requestAnimationFrame(renderPrediction);
//   }

//   const runDetection = async () => {
//     console.log("ctx:");
//     canvasObjects.removeHand("both");
//     const handModel = handPoseDetection.SupportedModels.MediaPipeHands;
//     const detectorConfig = {
//       runtime: "tfjs",
//       modelType: "full",
//     };
//     handposeDetector = await handPoseDetection.createDetector(
//       handModel,
//       detectorConfig
//     );

//     console.log("Handpose model loaded");
//     canvasObjects.initializeIndicator("left");
//     canvasObjects.initializeIndicator("right");
//     if (canvasObjects.canvas) {
//       canvasObjects.addHandToScene("both");
//     }
//     // get video properties

//     // console.log(handPos.handPosVec);
//     const videoWidth = webcamRef.current.video.videoWidth;
//     const videoHeight = webcamRef.current.video.videoHeight;
//     handCanvasRef.current.width = videoWidth;
//     handCanvasRef.current.height = videoHeight;

//     const test = true;
//     if (
//       (canvasObjects.focus &&
//         (canvasObjects.customizeMode || canvasObjects.mode !== "editing")) ||
//       test
//     ) {
//       renderPrediction();
//     }
//   };

//   const detect = async (net) => {
//     if (
//       typeof webcamRef.current !== "undefined" &&
//       webcamRef.current !== null &&
//       webcamRef.current.video.readyState === 4
//     ) {
//       // r = editor.canvas.width / videoHeight;
//       r = 1;
//       const video = webcamRef.current.video;
//       // set video height and width
//       // webcamRef.current.video.width = videoWidth;
//       // webcamRef.current.video.height = videoHeight;
//       webcamRef.current.video.width = editor.canvas.width;
//       webcamRef.current.video.height = editor.canvas.height;
//       // console.log(editor.canvas.getObjects().length);
//       // console.log(editor.canvas.width, videoWidth);
//       // console.log(editor.canvas.height, videoHeight);
//       // console.log(editor.canvas.width, webcamRef.current.video.width);
//       // console.log(editor.canvas.height, webcamRef.current.video.height);
//       // set canvas height and width

//       // let startTime = new Date().getUTCMilliseconds();
//       detectIdle = false;
//       const hands = await net.estimateHands(video, { flipHorizontal: true });
//       // if (hands && hands.length > 0) {
//       //   drawResults(hands, ctx);
//       // }
//       // drawCtx(ctx, video);
//       const ctx = handCanvasRef.current.getContext("2d");
//       // console.log(video.videoWidth, video.videoHeight);
//       ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

//       let [handPosVec, handCenterVec] = handPos.updatePosition(hands);
//       handPosArr.updateHandArr(handPosVec, handCenterVec);

//       canvasObjects.showHand("both");
//     }
//   };

//   useEffect(() => {
//     if (previewMode) {
//       // ctx.drawImage(Stitch, 10, 10);
//       const ctx = handCanvasRef.current.getContext("2d");
//       // console.log(ctx.drawImage);
//       runDetection();
//     }
//     ws.onopen = function () {
//       console.log("Socket Connection Open");
//     };
//     ws.onmessage = function (event) {
//       let message = JSON.parse(event.data);
//       if (message.name === "registerHandAnalyzer") {
//         canvasObjects.focus.setActive();
//       }
//       if (message.name === "returnAnimationParam") {
//         let gesture = message.gesture;
//         let avgDis = message.avgDis;
//         let dirVec = message.dirVec;
//         canvasObjects.curGesture = gesture;
//         if (avgDis < 1 && !canvasObjects.focus.entered) {
//           canvasObjects.focus.enter();
//         }
//         if (canvasObjects.focus.entered) {
//           canvasObjects.focus.animateTo(r);
//         }
//       }
//       if (message.wid) {
//         tracker.trackTo(message.wid);
//       }
//     };
//     ws.onclose = function () {
//       console.log("socket closed");
//     };

//     ws.onerror = function () {
//       console.log("socket error");
//     };
//   }, [previewMode]);

//   return (
//     <div className="main-panel" id="visual-panel">
//       {previewMode && (
//         <Webcam
//           className="webcam_component"
//           id="myWebcam"
//           ref={webcamRef}
//           forceScreenshotSourceSize="true"
//           screenshotFormat="image/jpeg"
//           style={{
//             zIndex: -1,
//             position: "absolute",
//             height: "100%",
//             width: "100%",
//             visibility: "hidden",
//           }}
//           mirrored={true}
//         />
//       )}
//       <canvas
//         className="webcam_component"
//         id="myCanvas"
//         ref={handCanvasRef}
//         style={{
//           position: "absolute",
//           zIndex: 100,
//           // border: "2px solid black",
//           height: "100%",
//         }}
//       />
//       <FabricJSCanvas className="canvas-panel" onReady={onReady} />
//       <div className="bottom left" id="infobox"></div>

//       <div className="bottom right">
//         <Stack direction="row">
//           <IconButton
//             aria-label="videocam"
//             onClick={handleChangeMode}
//             style={{
//               zIndex: 999,
//             }}
//           >
//             <VideocamIcon
//               className={`${previewMode ? "color-primary" : ""}`}
//               fontSize="small"
//             />
//           </IconButton>
//           <IconButton
//             aria-label="scriptfollow"
//             onClick={handleChangeScriptFollowing}
//             style={{
//               zIndex: 99,
//             }}
//           >
//             <AutoGraphIcon
//               fontSize="small"
//               className={`${scriptFollowing ? "color-primary" : ""}`}
//             />
//           </IconButton>
//         </Stack>
//       </div>
//     </div>
//   );
// });

// export default VisualPanel;
