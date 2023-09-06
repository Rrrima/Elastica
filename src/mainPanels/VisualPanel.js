import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VideocamIcon from "@mui/icons-material/Videocam";
import PauseIcon from "@mui/icons-material/Pause";
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
import vid from "../resources/videos/drumeo.mp4";
import { Hidden } from "@mui/material";
import Webcam from "react-webcam";

const VisualPanel = (props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoMode, setVideoMode] = useState("camera");
  const editor = props.editor;
  const onReady = props.onReady;
  const videoRef = useRef(null);
  const videoCanvasRef = useRef(null);
  const webcamRef = useRef(null);

  let rafId = 0;

  const handModel = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: "tfjs",
    modelType: "full",
  };
  let handposeDetector = null;

  useEffect(() => {
    canvasObjects.setUpCanvas(editor, videoCanvasRef.current);
  }, [editor, videoCanvasRef]);

  const handlePlay = () => {
    if (isPlaying) {
      if (handposeDetector != null) {
        handposeDetector.dispose();
        handposeDetector = null;
      }
      window.cancelAnimationFrame(rafId);
      videoRef.current.pause();
    } else {
      runDetection();
    }
    setIsPlaying(!isPlaying);
  };

  const handleChangeMode = () => {
    if (videoMode === "camera") {
      setVideoMode("video");
    } else {
      setVideoMode("camera");
    }
  };

  async function renderResult() {
    await detect(handposeDetector);
  }

  async function renderPrediction() {
    // beginEstimateHandsStats();
    await detect(handposeDetector);
    // endEstimateHandsStats();
    rafId = requestAnimationFrame(renderPrediction);
  }

  async function runFrame() {
    if (videoRef.current.paused) {
      // video has finished.
      canvasObjects.mediaRecorder.stop();
      return;
    }
    await renderResult();
    rafId = requestAnimationFrame(runFrame);
  }

  const runDetection = async () => {
    console.log("start run detection");

    handposeDetector = await handPoseDetection.createDetector(
      handModel,
      detectorConfig
    );

    if (videoMode === "video") {
      const warmUpTensor = tf.fill(
        [videoRef.current.videoHeight, videoRef.current.videoWidth, 3],
        0,
        "float32"
      );
      await handposeDetector.estimateHands(warmUpTensor, {
        flipHorizontal: false,
      });
      warmUpTensor.dispose();
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      canvasObjects.mediaRecorder.start();

      await new Promise((resolve) => {
        videoRef.current.onseeked = () => {
          resolve(videoRef.current);
        };
      });

      await runFrame();
    } else {
      renderPrediction(handposeDetector);
    }
  };

  const detect = async (net) => {
    if (videoRef.current) {
      const hands = await net.estimateHands(videoRef.current, {
        flipHorizontal: false,
      });
      console.log(hands);
    } else if (webcamRef.current) {
      console.log("webcam mode");
      const video = webcamRef.current.video;
      const hands = await net.estimateHands(video, { flipHorizontal: true });
      console.log(hands);
    }
  };

  useEffect(() => {
    if (webcamRef.current) {
      runDetection();
    }
  });

  return (
    <div className="main-panel" id="visual-panel">
      {videoMode === "camera" && (
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
      {videoMode === "video" && (
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

      <div className="bottom left" id="toolbox">
        <Stack direction="row">
          <IconButton aria-label="videocam" onClick={handlePlay}>
            {!isPlaying && (
              <PlayArrowIcon className="color-primary" fontSize="small" />
            )}
            {isPlaying && (
              <PauseIcon className="color-primary" fontSize="small" />
            )}
          </IconButton>
          <IconButton aria-label="videocam" onClick={handleChangeMode}>
            <VideocamIcon className="color-primary" fontSize="small" />
          </IconButton>
        </Stack>
      </div>
    </div>
  );
};

export default VisualPanel;

/* <Stack direction="row">
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
        </Stack> */
