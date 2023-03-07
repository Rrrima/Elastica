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
import { canvasObjects } from "../global";

const VisualPanel = React.forwardRef((props, ref) => {
  // const { editor, onReady } = useFabricJSEditor();
  const [previewMode, setMode] = useState(false);
  const editor = props.editor;
  const onReady = props.onReady;
  const webcamRef = useRef(null);
  const handCanvasRef = useRef(null);
  canvasObjects.canvas = editor;

  const handleChangeMode = () => {
    if (previewMode) {
      const ctx = handCanvasRef.current.getContext("2d");
      ctx.clearRect(
        0,
        0,
        handCanvasRef.current.width,
        handCanvasRef.current.height
      );
    }
    setMode(!previewMode);
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
    setInterval(() => {
      detect(handposeDetector);
    }, 16);
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

      // set video height and width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // set canvas height and width
      handCanvasRef.current.width = videoWidth;
      handCanvasRef.current.height = videoHeight;
      const hands = await net.estimateHands(video, { flipHorizontal: true });
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
          }}
          mirrored={true}
        />
      )}
      <FabricJSCanvas className="canvas-panel" onReady={onReady} />
      <canvas
        className="webcam_component"
        id="myCanvas"
        ref={handCanvasRef}
        style={{
          position: "absolute",
          zIndex: 10,
        }}
      />
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
