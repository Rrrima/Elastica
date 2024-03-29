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
  const [scriptFollowing, setScriptFollowing] = useState(false);
  var { transcript, resetTranscript } = useSpeechRecognition({});
  const editor = props.editor;
  const onReady = props.onReady;
  const webcamRef = useRef(null);
  const test = false;
  console.log(editor);
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
  let startInferenceTime,
    numInferences = 0;
  let inferenceTimeSum = 0,
    lastPanelUpdate = 0;

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

  if (scriptFollowing && transcript) {
    ws.send(
      JSON.stringify({
        name: "scriptFollowing",
        params: { transcript: transcript },
      })
    );
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

  const handleChangeScriptFollowing = () => {
    setScriptFollowing(!scriptFollowing);
    if (!scriptFollowing) {
      canvasObjects.startPresentation();
      canvasObjects.textEditor.current.editor.save().then((data) => {
        let currentScript = data.blocks[0].data.text;
        populateScript(currentScript);
      });
      SpeechRecognition.startListening({ continuous: true });
    } else {
      tracker.revertQ();
      resetTranscript();
      SpeechRecognition.abortListening();
      canvasObjects.endPresentation();
      ws.send(
        JSON.stringify({
          name: "transcriptionComplete",
          params: {},
        })
      );
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
      // console.log(handPos.handPosVec);
      // const videoWidth = webcamRef.current.video.videoWidth;
      // const videoHeight = webcamRef.current.video.videoHeight;
      // r = editor.canvas.width / videoHeight;
      // r = 1;
      // set video height and width
      // webcamRef.current.video.width = videoWidth;
      // webcamRef.current.video.height = videoHeight;
      webcamRef.current.video.width = editor.canvas.width;
      webcamRef.current.video.height = editor.canvas.height;
      // console.log(editor.canvas.getObjects().length);
      // console.log(editor.canvas.width, videoWidth);
      // console.log(editor.canvas.height, videoHeight);
      // console.log(editor.canvas.width, webcamRef.current.video.width);
      // console.log(editor.canvas.height, webcamRef.current.video.height);
      // set canvas height and width
      // handCanvasRef.current.width = videoWidth;
      // handCanvasRef.current.height = videoHeight;
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
      // console.log(obj.effect);
      // if (obj.effect === "customize") {
      //   let w = handRecord.calculateDis();
      //   let pm = handPos.getAnimationParam;
      // } else {
      aniDriver.activeObjects.forEach((obj) => {
        if (obj && obj.animateFocus) {
          if (obj.t < 300) {
            canvasObjects.indicateColor = "red";
          } else {
            canvasObjects.indicateColor = "blue";
          }
          let pm = obj.getAnimationParams();
          // console.log(pm);
          // console.log(pm);
          obj.animateTo(pm);
        }
        if (obj && obj.animateReady && !obj.animateFocus) {
          obj.detectIntentionality();
        }
      });
    }
  };

  useEffect(() => {
    if (previewMode) {
      runDetection();
    }

    ws.onopen = function () {
      console.log("Socket Connection Open");
    };
    ws.onmessage = function (event) {
      let message = JSON.parse(event.data);
      if (message.wid) {
        tracker.trackTo(message.wid);
      }
    };
    ws.onclose = function () {
      console.log("socket closed");
    };

    ws.onerror = function () {
      console.log("socket error");
    };
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
      <FabricJSCanvas className="canvas-panel" onReady={onReady} />
      {/* {previewMode && (
        <canvas
          className="webcam_component"
          id="myCanvas"
          ref={handCanvasRef}
          style={{
            position: "absolute",
            zIndex: 10,
          }}
        />
      )} */}
      <div className="bottom left" id="infobox"></div>

      <div className="bottom right">
        <Stack direction="row">
          <IconButton aria-label="videocam" onClick={handleChangeMode}>
            <VideocamIcon
              className={`${previewMode ? "color-primary" : ""}`}
              fontSize="small"
            />
          </IconButton>
          <IconButton
            aria-label="scriptfollow"
            onClick={handleChangeScriptFollowing}
          >
            <AutoGraphIcon
              fontSize="small"
              className={`${scriptFollowing ? "color-primary" : ""}`}
            />
          </IconButton>
        </Stack>
      </div>
    </div>
  );
});

export default VisualPanel;
