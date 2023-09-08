import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { FabricJSCanvas } from "fabricjs-react";
import { useRef, useEffect, useState } from "react";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import * as tf from "@tensorflow/tfjs";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";

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
  const [scriptFollowing, setScriptFollowing] = useState(false);
  var { transcript, resetTranscript } = useSpeechRecognition({});
  const editor = props.editor;
  const onReady = props.onReady;
  const videoRef = useRef(null);
  const videoCanvasRef = useRef(null);

  let rafId;
  let gNumWordsInScript = 0;

  const handModel = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: "tfjs",
    modelType: "full",
  };
  let handposeDetector = null;

  useEffect(() => {
    canvasObjects.setUpCanvas(editor, videoRef.current, setIsPlaying);
    ws.onopen = function () {
      console.log("Socket Connection Open");
    };
    ws.onmessage = function (event) {
      let message = JSON.parse(event.data);
      console.log(event);
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
  }, [editor, videoCanvasRef]);

  useEffect(() => {
    if (!isPlaying) {
      if (handposeDetector != null) {
        handposeDetector.dispose();
        handposeDetector = null;
      }
      window.cancelAnimationFrame(rafId);
      videoRef.current.pause();
    } else {
      runDetection();
    }
  }, [isPlaying]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

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
    let index = 0;
    for (const token of tokens) {
      if (token.toLowerCase().match(/[^_\W]+/g)) {
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

  async function runFrame() {
    if (videoRef.current.paused) {
      canvasObjects.mediaRecorder.stop();
      return;
    }
    await detect(handposeDetector);
    rafId = requestAnimationFrame(runFrame);
  }

  const runDetection = async () => {
    console.log("start run detection");
    canvasObjects.removeHand("both");

    handposeDetector = await handPoseDetection.createDetector(
      handModel,
      detectorConfig
    );

    const warmUpTensor = tf.fill(
      [parseInt(editor.canvas.height), parseInt(editor.canvas.width), 3],
      0,
      "float32"
    );
    await handposeDetector.estimateHands(warmUpTensor, {
      flipHorizontal: false,
    });
    warmUpTensor.dispose();
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    // canvasObjects.mediaRecorder.start();
    canvasObjects.initializeIndicator("left");
    canvasObjects.initializeIndicator("right");
    if (canvasObjects.canvas) {
      canvasObjects.addHandToScene("both");
    }

    await runFrame();
  };

  const detect = async (net) => {
    if (videoRef.current) {
      const video = videoRef.current;
      videoRef.current.width = editor.canvas.width;
      videoRef.current.height = editor.canvas.height;
      const hands = await net.estimateHands(video, { flipHorizontal: false });
      let [handPosVec, handCenterVec] = handPos.updatePosition(hands);
      handPosArr.updateHandArr(handPosVec, handCenterVec);
      // const isIntentioanl = handPosArr.isIntentional("left");
      canvasObjects.showHand("both");

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

  return (
    <div className="main-panel" id="visual-panel">
      <video
        ref={videoRef}
        style={{
          zIndex: -1,
          position: "absolute",
          height: "100%",
          top: 0,
        }}
        src={vid}
      />

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
