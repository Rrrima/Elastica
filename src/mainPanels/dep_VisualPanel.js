import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import VideocamIcon from "@mui/icons-material/Videocam";
// import MicIcon from "@mui/icons-material/Mic";
import Webcam from "react-webcam";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import { FabricJSCanvas } from "fabricjs-react";
import { useRef, useEffect, useState } from "react";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import * as tf from "@tensorflow/tfjs";
import vid from "../resources/videos/drumeo.mp4";
import {
  canvasObjects,
  handPos,
  handPosArr,
  ws,
  handRecord,
  aniDriver,
} from "../global";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { tracker } from "../global";

const VisualPanel = React.forwardRef((props, ref) => {
  // const { editor, onReady } = useFabricJSEditor();
  const [previewMode, setMode] = useState(false);
  const editor = props.editor;
  const onReady = props.onReady;
  const videoRef = useRef(null);
  const videoCanvasRef = useRef(null);
  const webcamRef = useRef(null);
  const test = false;
  // const handCanvasRef = useRef(null);
  const handModel = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: "tfjs",
    modelType: "full",
  };
  let handposeDetector = null;

  let gNumWordsInScript = 0;
  canvasObjects.canvas = editor;
  // let r = 1;
  if (editor) {
    editor.canvas.setWidth(canvasObjects.canvasWidth);
  }

  let rafId;

  useEffect(() => {
    canvasObjects.setUpCanvas(editor, videoCanvasRef.current);
  }, [editor, videoCanvasRef]);

  function generateSpan(inToken, inIndex) {
    return '<span id="' + inIndex + '">' + inToken + " </span>";
  }

  function populateScript(inString) {
    // Sending the script when populated by default (python server should be connected)
    ws.send(
      JSON.stringify({
        name: "populateScript",
        params: { referenceScript: inString },
      })
    );
    // split into tokens
    const tokens = inString.split(/\s+/);
    // generate spans
    let htmlString = "";
    let index = 0;
    for (const token of tokens) {
      if (token.toLowerCase().match(/[^_\W]+/g)) {
        htmlString += generateSpan(token, index);
        index++;
      }
    }

    gNumWordsInScript = index;
    console.log("Number of words in the script", gNumWordsInScript);

    // const tpScript = document.getElementById("teleprompter-script");
    // tpScript.innerHTML = htmlString;
  }

  const handleChangeMode = () => {
    canvasObjects.removeHand("both");
    setMode(!previewMode);
    canvasObjects.canmeraOn = !canvasObjects.canmeraOn;
    if (previewMode) {
      if (handposeDetector != null) {
        handposeDetector.dispose();
        handposeDetector = null;
      }
      window.cancelAnimationFrame(rafId);
    }
  };

  // function beginEstimateHandsStats() {
  //   startInferenceTime = (performance || Date).now();
  // }

  // function endEstimateHandsStats() {
  //   const endInferenceTime = (performance || Date).now();
  //   inferenceTimeSum += endInferenceTime - startInferenceTime;
  //   ++numInferences;

  //   const panelUpdateMilliseconds = 1000;
  //   if (endInferenceTime - lastPanelUpdate >= panelUpdateMilliseconds) {
  //     const averageInferenceTime = inferenceTimeSum / numInferences;
  //     inferenceTimeSum = 0;
  //     numInferences = 0;
  //     console.log(averageInferenceTime);
  //     lastPanelUpdate = endInferenceTime;
  //   }
  // }

  async function renderPrediction() {
    // beginEstimateHandsStats();
    await detect(handposeDetector);
    // endEstimateHandsStats();
    rafId = requestAnimationFrame(renderPrediction);
  }

  const runDetection = async () => {
    canvasObjects.removeHand("both");

    handposeDetector = await handPoseDetection.createDetector(
      handModel,
      detectorConfig
    );

    canvasObjects.initializeIndicator("left");
    canvasObjects.initializeIndicator("right");
    if (canvasObjects.canvas) {
      canvasObjects.addHandToScene("both");
    }
    // canvasObjects.canvas.canvas.add(canvasObjects.handIndicator);
    // const test = false;
    // if (
    //   (canvasObjects.focus &&
    //     (canvasObjects.customizeMode || canvasObjects.mode !== "editing")) ||
    //   test
    // ) {
    renderPrediction(handposeDetector);
    // }
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // get video properties
      const video = webcamRef.current.video;
      webcamRef.current.video.width = editor.canvas.width;
      webcamRef.current.video.height = editor.canvas.height;
      const hands = await net.estimateHands(video, { flipHorizontal: true });
      let [handPosVec, handCenterVec] = handPos.updatePosition(hands);
      handPosArr.updateHandArr(handPosVec, handCenterVec);
      // const isIntentioanl = handPosArr.isIntentional("left");
      if (
        (canvasObjects.focus &&
          (canvasObjects.customizeMode || canvasObjects.mode !== "editing")) ||
        test
      ) {
        canvasObjects.showHand("both");
      }
    }
  };

  useEffect(() => {
    if (previewMode) {
      runDetection();
    }
  }, [previewMode]);

  return (
    <div className="main-panel" id="visual-panel">
      {previewMode && (
        <Webcam
          className="webcam_component"
          id="myWebcam"
          ref={webcamRef}
          forceScreenshotSourceSize="true"
          screenshotFormat="image/jpeg"
          style={{
            zIndex: -1,
            position: "absolute",
            height: "100%",
            width: "100%",
          }}
          mirrored={true}
        />
      )}
      {!previewMode && (
        <video
          ref={videoRef}
          style={{
            zIndex: -1,
            position: "absolute",
            width: 787,
            height: 665,
            top: 0,
            // visibility: "hidden",
            opacity: 0.2,
          }}
          src={vid}
        />
      )}
      <canvas id="videoCanvas" ref={videoCanvasRef} />
      <FabricJSCanvas className="canvas-panel" onReady={onReady} />

      <div className="bottom right">
        <Stack direction="row">
          <IconButton aria-label="videocam" onClick={handleChangeMode}>
            <VideocamIcon
              className={`${previewMode ? "color-primary" : ""}`}
              fontSize="small"
            />
          </IconButton>
        </Stack>
      </div>
    </div>
  );
});

export default VisualPanel;
