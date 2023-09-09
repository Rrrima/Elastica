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
import { canvasObjects, handPos, handPosArr, ws, aniDriver } from "../global";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { tracker } from "../global";
import { Switch } from "@mui/material";

const VisualPanel = React.forwardRef((props, ref) => {
  // const { editor, onReady } = useFabricJSEditor();
  const [previewMode, setMode] = useState(false);
  const [scriptFollowing, setScriptFollowing] = useState(false);
  var { transcript, resetTranscript } = useSpeechRecognition({});
  const editor = props.editor;
  const onReady = props.onReady;
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

  function generateSpan(inToken, inIndex) {
    return '<span id="' + inIndex + '">' + inToken + " </span>";
  }

  function populateScript(inString) {
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
  }

  if (scriptFollowing && transcript) {
    console.log(transcript);
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

    renderPrediction(handposeDetector);
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

      if (!canvasObjects.isDragging) {
        canvasObjects.detectPinchedObject();
      } else {
        canvasObjects.dragginObj.dragTo(
          handPos.getFingertipPos(canvasObjects.pinched[0], ["index"])["index"]
        );
        canvasObjects.detectUnPinch();
      }

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
          // let pm = obj.getAnimationParams();
          // obj.animateTo(pm);
          const pm = obj.getDmParameters();
          obj.setTo(pm);
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
          {/* <Switch defaultChecked /> */}
        </Stack>
      </div>
    </div>
  );
});

export default VisualPanel;
