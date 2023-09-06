import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
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

const VisualPanel = (props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const editor = props.editor;
  const onReady = props.onReady;
  const videoRef = useRef(null);
  const videoCanvasRef = useRef(null);

  const test = true;
  const handModel = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: "tfjs",
    modelType: "full",
  };
  let handposeDetector = null;

  useEffect(() => {
    canvasObjects.setUpCanvas(editor, videoCanvasRef.current);
  }, [editor, videoCanvasRef]);

  let rafId;

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

  // async function renderPrediction() {
  //   // within each animation frame
  //   await detect(handposeDetector);
  //   rafId = requestAnimationFrame(renderPrediction);
  // }
  async function renderResult() {
    // canvasObjects.drawVideoFrame(videoRef.current);
    await detect(handposeDetector);
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
    // videoRef.current.play();
    // renderPrediction(handposeDetector);
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    canvasObjects.mediaRecorder.start();

    await new Promise((resolve) => {
      videoRef.current.onseeked = (e) => {
        resolve(videoRef.current);
      };
    });

    await runFrame();
  };

  const detect = async (net) => {
    if (videoRef.current) {
      // const video = videoRef.current;
      const hands = await net.estimateHands(videoRef.current, {
        flipHorizontal: false,
      });
      console.log(hands);
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

      aniDriver.activeObjects.forEach((obj) => {
        if (obj && obj.animateFocus) {
          if (obj.t < 300) {
            canvasObjects.indicateColor = "red";
          } else {
            canvasObjects.indicateColor = "blue";
          }
          let pm = obj.getAnimationParams();
          obj.animateTo(pm);
        }
        if (obj && obj.animateReady && !obj.animateFocus) {
          obj.detectIntentionality();
        }
      });
    }
  };

  return (
    <div className="main-panel" id="visual-panel">
      <video
        ref={videoRef}
        style={{
          zIndex: -1,
          position: "absolute",
          height: "100%",
          top: 0,
          // visibility: "hidden",
          opacity: 0.2,
        }}
        src={vid}
      />

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
