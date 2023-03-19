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
import { canvasObjects, handPos, handPosArr, ws } from "../global";

const VisualPanel = React.forwardRef((props, ref) => {
  // const { editor, onReady } = useFabricJSEditor();
  const [previewMode, setMode] = useState(false);
  const editor = props.editor;
  const onReady = props.onReady;
  const webcamRef = useRef(null);
  const handCanvasRef = useRef(null);
  let r = 1;
  canvasObjects.canvas = editor;

  const handleChangeMode = () => {
    setMode(!previewMode);
    canvasObjects.canmeraOn = !canvasObjects.canmeraOn;
  };

  const runDetection = async () => {
    const handModel = handPoseDetection.SupportedModels.MediaPipeHands;
    const detectorConfig = {
      runtime: "tfjs",
      modelType: "full",
    };
    const handposeDetector = await handPoseDetection.createDetector(
      handModel,
      detectorConfig
    );
    console.log("Handpose model loaded");
    canvasObjects.initializeIndicator("left");
    // canvasObjects.canvas.canvas.add(canvasObjects.handIndicator);
    // detect every 20ms -- [].length == 10
    setInterval(() => {
      // if (webcamRef.current) {
      //   console.log(webcamRef.current.video.videoWidth);
      //   console.log(webcamRef.current.video.width);
      // }
      // webcamRef.current.video.videoWidth = editor.canvas.width;
      // const test = true;
      if (canvasObjects.focus && canvasObjects.focus.customize) {
        detect(handposeDetector);
      }
    }, 50);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      // r = editor.canvas.width / videoHeight;
      r = 1;
      // set video height and width
      // webcamRef.current.video.width = videoWidth;
      // webcamRef.current.video.height = videoHeight;
      webcamRef.current.video.width = editor.canvas.width;
      webcamRef.current.video.height = editor.canvas.height;
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
      canvasObjects.visHand("left");
      // console.log(handPos.getHandAngle("left"));

      // get animation parameter for currentfocus
      // TODO: deal with right hand
      // if (!canvasObjects.focus.entered) {
      // ws.send(
      //   JSON.stringify({
      //     name: "getAnimationParam",
      //     params: {
      //       handPosArr: handPosArr.arrLeft,
      //       handCenterArr: handPosArr.arrCenterLeft,
      //       focused: canvasObjects.focus.relatedText,
      //     },
      //   })
      // );
      // } else {
      //   canvasObjects.focus.moveTo(r);
      // }
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
      if (message.name === "registerHandAnalyzer") {
        canvasObjects.focus.setActive();
      }
      if (message.name === "returnAnimationParam") {
        let gesture = message.gesture;
        let avgDis = message.avgDis;
        let dirVec = message.dirVec;
        canvasObjects.curGesture = gesture;
        if (avgDis < 1 && !canvasObjects.focus.entered) {
          canvasObjects.focus.enter();
        }
        if (canvasObjects.focus.entered) {
          canvasObjects.focus.animateTo(r);
        }
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
      <div className="bottom right">
        <Stack direction="row">
          <IconButton aria-label="videocam" onClick={handleChangeMode}>
            <VideocamIcon
              className={`${previewMode ? "color-primary" : ""}`}
              fontSize="small"
            />
          </IconButton>
          <IconButton aria-label="scriptfollow">
            <AutoGraphIcon fontSize="small" className="color-primary" />
          </IconButton>
        </Stack>
      </div>
    </div>
  );
});

export default VisualPanel;
