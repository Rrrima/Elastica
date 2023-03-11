import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { objectDict } from "../resources/ObjectDict";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Checkbox from "@mui/material/Checkbox";
import { useRef } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { canvasObjects } from "../global";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Stack from "@mui/material/Stack";
import PauseIcon from "@mui/icons-material/Pause";
import { useState } from "react";

gsap.registerPlugin(Draggable);

function TimelineSection() {
  const [isPlay, setPlayMode] = useState(false);
  function changePlayMode() {
    setPlayMode(!isPlay);
    if (!isPlay) {
      canvasObjects.focus.play();
    }
  }
  function getTimePercentage(d) {
    return d.x / (d.maxX - d.minX);
  }
  const scrubberRef = useRef(null);
  const scrubber = Draggable.create("#scrubber", {
    type: "x",
    bounds: document.getElementById("timeline"),
    onDrag: () => {
      let tp = getTimePercentage(scrubber[0]);
      canvasObjects.focus.playAt(tp);
    },
  });
  return (
    <div className="config-section">
      timeline
      <div id="timeline-container">
        <Stack direction="row" spacing={1}>
          <IconButton aria-label="delete" onClick={changePlayMode}>
            {!isPlay && <PlayArrowIcon />}
            {isPlay && <PauseIcon />}
          </IconButton>
          <div id="timeline"></div>
        </Stack>
        <div id="scrubber" ref={scrubberRef}></div>
      </div>
    </div>
  );
}

function InfoBadge(props) {
  const { status, selectedText } = props;
  return (
    <div>
      <span className={`${status}-indicator`}>{status.toUpperCase()}</span>
      <span> animation for </span>
      <Chip
        className={`${status}-chip`}
        label={selectedText}
        // label = "ohana means family"
        onClick={() => {
          console.log("clicked!");
        }}
      />
    </div>
  );
}

function HandedSelection() {
  return (
    <div className="config-section">
      <FormControl>
        <FormLabel id="handed-selection">handed</FormLabel>
        <RadioGroup
          row
          aria-labelledby="handed-row-radio-buttons-group-label"
          name="handed-controlp"
          defaultValue="left"
        >
          <FormControlLabel value="left" control={<Radio />} label="left" />
          <FormControlLabel value="right" control={<Radio />} label="right" />
          <FormControlLabel value="both" control={<Radio />} label="both" />
          <FormControlLabel
            value="disabled"
            disabled
            control={<Radio />}
            label="random"
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
}

function ParamSelection() {
  return (
    <div className="config-section">
      <FormControl>
        <FormLabel id="after-enter-selection">after entering:</FormLabel>
        <RadioGroup
          row
          aria-labelledby="after-enter-row-radio-buttons-group-label"
          name="after-enter-control"
        >
          <FormControlLabel value="stay" control={<Radio />} label="stay" />
          <FormControlLabel
            value="floating"
            control={<Radio />}
            label="floating"
          />
          <FormControlLabel
            value="following"
            control={<Radio />}
            label="following"
          />
          <FormControlLabel value="exit" control={<Radio />} label="exit" />
        </RadioGroup>
      </FormControl>
    </div>
  );
}

function AfterEnterSelection() {
  return (
    <div className="config-section">
      <FormControl>
        <FormLabel id="after-enter-selection">after entering:</FormLabel>
        <RadioGroup
          row
          aria-labelledby="after-enter-row-radio-buttons-group-label"
          name="after-enter-control"
          defaultValue="stay"
        >
          <FormControlLabel value="stay" control={<Radio />} label="stay" />
          <FormControlLabel
            value="floating"
            control={<Radio />}
            label="floating"
          />
          <FormControlLabel
            value="following"
            control={<Radio />}
            label="following"
          />
          <FormControlLabel value="exit" control={<Radio />} label="exit" />
        </RadioGroup>
      </FormControl>
    </div>
  );
}

function EnterTemplateSelection() {
  const handleChange = (e) => {
    console.log("change template animation");
    canvasObjects.focus.changeEnterSetting("effect", e.target.value);
  };
  return (
    <div className="config-section">
      <FormControl>
        <FormLabel id="enter-template-selection">enter effect:</FormLabel>
        <RadioGroup
          row
          aria-labelledby="enter-template-row-radio-buttons-group-label"
          name="enter-template-control"
          onChange={handleChange}
          defaultValue="appear"
        >
          <FormControlLabel value="appear" control={<Radio />} label="appear" />
          <FormControlLabel
            value="float"
            control={<Radio />}
            label="float up"
          />
          <FormControlLabel value="zoom" control={<Radio />} label="zoom in" />
          <FormControlLabel
            value="sketch"
            control={<Radio />}
            label="sketching"
          />
          <FormControlLabel
            value="customize"
            control={<Radio />}
            label="customize"
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
}

function GraphicParamBox(props) {
  const { status, selectedText } = props;
  let params = {};
  if (status === "enter") {
    params = objectDict["stitch"][status];
  }
  return (
    <div>
      <div id="common-param-box">
        <div id="width-input-container">
          <span className="param-tag">width</span>
          <TextField
            id="width-input"
            className="param-input"
            variant="standard"
            defaultValue={params.width}
          />
        </div>
        <div id="height-input-container">
          <span className="param-tag">height</span>
          <TextField
            id="height-input"
            className="param-input"
            variant="standard"
          />
        </div>
        <div id="x-input-container">
          <span className="param-tag">x</span>
          <TextField id="x-input" className="param-input" variant="standard" />
        </div>
        <div id="y-input-container">
          <span className="param-tag">y</span>
          <TextField id="y-input" className="param-input" variant="standard" />
        </div>
        <div id="rotation-input-container">
          <span className="param-tag">rotation</span>
          <TextField
            id="totation-input"
            className="param-input"
            variant="standard"
          />
        </div>
        <div id="speed-input-container">
          <span className="param-tag disabled-field">speed</span>
          <TextField
            id="speed-input"
            className="param-input"
            variant="standard"
            disabled
          />
        </div>
      </div>
    </div>
  );
}

export {
  InfoBadge,
  GraphicParamBox,
  HandedSelection,
  AfterEnterSelection,
  EnterTemplateSelection,
  TimelineSection,
};
