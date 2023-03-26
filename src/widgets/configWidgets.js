import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { objectDict } from "../resources/ObjectDict";
import Radio from "@mui/material/Radio";
import { Switch } from "@mui/material";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Checkbox from "@mui/material/Checkbox";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { canvasObjects } from "../global";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Stack from "@mui/material/Stack";
import PauseIcon from "@mui/icons-material/Pause";
import { useState } from "react";
import { ws } from "../global";
import { handRecord } from "../global";
import { aniDriver } from "../global";
import { FabricJSCanvas } from "fabricjs-react";
import { useFabricJSEditor } from "fabricjs-react";
import { fabric } from "fabric";
import Divider from "@mui/material/Divider";
import StarsIcon from "@mui/icons-material/Stars";

gsap.registerPlugin(Draggable);

function handleCustomizationEnter(e) {
  const checked = e.target.checked;
  let curObj = canvasObjects.focus;
  curObj.enterSetting["customize"] = curObj.handRecord.isrecorded(
    canvasObjects.focusedText
  );
  if (checked && !canvasObjects.canmeraOn) {
    console.log("please open camera for customization");
    canvasObjects.startCustomization(curObj.enterSetting.handed);
  } else if (checked) {
    canvasObjects.startCustomization(curObj.enterSetting.handed);
  } else {
    canvasObjects.endCustomization();
  }
}

function handleCustomizationUpdate(e) {
  const checked = e.target.checked;
  let curObj = canvasObjects.focus;
  let curText = canvasObjects.focusedText;
  curObj.updates[curText].setting.customize = curObj.handRecord.isrecorded(
    canvasObjects.focusedText
  );
  if (curObj.updates[curText].setting.customize && !canvasObjects.canmeraOn) {
    console.log("please open camera for customization");
    canvasObjects.startCustomization(curObj.updates[curText].setting.handed);
  } else if (checked) {
    canvasObjects.startCustomization(curObj.updates[curText].setting.handed);
  } else {
    canvasObjects.endCustomization();
  }
}

function TimelineSection() {
  // const [isPreview, setPreviewMode] = useState(false);

  function triggerPreviewAll() {
    aniDriver.activeObjects = [];
    let tlist = [];
    const curText = canvasObjects.focusedText;
    if (canvasObjects.objectDict[curText]) {
      canvasObjects.objectDict[curText].forEach((obj) => {
        tlist.push(obj.getTimeThred());
        aniDriver.activeObjects.push(obj);
      });
    }
    if (canvasObjects.updateDict[curText]) {
      canvasObjects.updateDict[curText].forEach((objid) => {
        console.log(objid);
        tlist.push(canvasObjects.idDict[objid].getTimeThred());
        aniDriver.activeObjects.push(canvasObjects.idDict[objid]);
      });
    }
    console.log(tlist);
    aniDriver.preview();
    if (canvasObjects.canmeraOn) {
      canvasObjects.startPreview();
      setTimeout(() => {
        canvasObjects.endPreview();
      }, Math.max(...tlist) * 2);
    }
  }

  // function getTimePercentage(d) {
  //   return (d.x - d.minX) / (d.maxX - d.minX);
  // }
  // const scrubberRef = useRef(null);
  // const scrubber = Draggable.create("#scrubber", {
  //   type: "x",
  //   bounds: document.getElementById("timeline"),
  //   onDrag: () => {
  //     // console.log(getTimePercentage(scrubber[0]));
  //     let tp = getTimePercentage(scrubber[0]);
  //     canvasObjects.focus.playAt(tp);
  //   },
  // });
  return (
    <div className="config-section">
      {/* <div id="timeline-container"> */}
      <Stack direction="row" spacing={1}>
        <item>
          <IconButton
            aria-label="playall"
            id="playall-button"
            onClick={triggerPreviewAll}
            disabled={canvasObjects.customizeMode}
            className={!canvasObjects.customizeMode ? "" : "disable-button"}
          >
            <PlayArrowIcon className="white-icon" fontSize="small" />
            {/* {!isPreview && <PlayArrowIcon fontSize="small" />} */}
          </IconButton>
        </item>
        <item>
          Play animation at:{" "}
          <Chip
            className={`focus-chip`}
            label={canvasObjects.focusedText}
            // label = "ohana means family"
            // onClick={() => {
            //   console.log("clicked!");
            // }}
          />
        </item>
        {/* play one
        <IconButton aria-label="playone" onClick={triggerPreview}>
          <PlayArrowIcon />
        </IconButton> */}
        {/* play all */}
      </Stack>
      {/* <div id="scrubber" ref={scrubberRef}></div> */}
      {/* </div> */}
    </div>
  );
}

function Thumbnail(props) {
  const { editor, onReady } = useFabricJSEditor();
  useEffect(() => {
    if (!editor || !fabric || !editor.canvas.isEmpty()) {
      return;
    } else {
      // const curfab = fabric.util.object.clone(
      //   canvasObjects.idDict[props.id].fabric
      // );
      canvasObjects.idDict[props.id].fabric.clone((cloned) => {
        cloned.set({
          top: 10,
          left: 10,
          scaleX: 0.5,
          scaleY: 0.5,
          selectable: false,
          opacity: 1,
        });
        editor.canvas.add(cloned);
        editor.canvas.renderAll();
      });
    }
  });
  return (
    <div>
      <FabricJSCanvas className="object-thumbnail" onReady={onReady} />
    </div>
  );
}

function InfoBadge(props) {
  const selectedText = canvasObjects.focusedText;
  const status = props.status;
  const curobj = canvasObjects.idDict[props.id];
  let setting = curobj.enterSetting;
  if (status === "update") {
    setting = curobj.updates[selectedText].setting;
  }
  return (
    <div>
      <span className={`${status}-indicator`}>{status.toUpperCase()}</span>
      <Chip
        label={setting.effect}
        className={`${status}effect-indicator`}
        // label = "ohana means family"
        // onClick={() => {
        //   console.log("clicked!");
        // }}
      />
      <span> | </span>
      {/* <Divider orientation="vertical" flexItem /> */}
      <Chip
        label={setting.handed}
        className={`${setting.handed}hand-indicator`}
        // label = "ohana means family"
        // onClick={() => {
        //   console.log("clicked!");
        // }}
      />
      {curobj.handRecord.isrecorded(selectedText) && (
        <div className="customize-indicator">
          <StarsIcon />
        </div>
      )}
    </div>
  );
}

/////////////////////////////////////////////////////
////////////////// Hand Selection ///////////////////
/////////////////////////////////////////////////////

function HandedSelection(props) {
  const handleChange = (e) => {
    // console.log("change template animation");
    canvasObjects.focus.changeEnterSetting("handed", e.target.value);
    canvasObjects.rerenderConfig();
    if (canvasObjects.customizeMode) {
      canvasObjects.removeHand("both");
      canvasObjects.addHandToScene(e.target.value);
    }
  };
  return (
    <div className="config-section">
      <FormControl>
        <FormLabel id="handed-selection">handed</FormLabel>
        <RadioGroup
          row
          aria-labelledby="handed-row-radio-buttons-group-label"
          name="handed-controlp"
          onChange={handleChange}
          defaultValue={
            canvasObjects.focus
              ? canvasObjects.focus.enterSetting["handed"]
              : "left"
          }
        >
          <FormControlLabel value="left" control={<Radio />} label="left" />
          <FormControlLabel value="right" control={<Radio />} label="right" />
          {/* <FormControlLabel
            value="both"
            disabled
            control={<Radio />}
            label="both"
          /> */}
          <FormControlLabel value="none" control={<Radio />} label="none" />
        </RadioGroup>
      </FormControl>
    </div>
  );
}

function UpdateHandedSelection(selectedText) {
  const handleChange = (e) => {
    // console.log("change template animation");
    canvasObjects.focus.changeUpdateSetting("handed", e.target.value);
    canvasObjects.rerenderConfig();
    if (canvasObjects.customizeMode) {
      canvasObjects.removeHand("both");
      canvasObjects.addHandToScene(e.target.value);
    }
  };
  return (
    <div className="config-section">
      <FormControl>
        <FormLabel id="handed-selection">handed</FormLabel>
        <RadioGroup
          row
          aria-labelledby="handed-row-radio-buttons-group-label"
          name="handed-controlp"
          onChange={handleChange}
          defaultValue={
            canvasObjects.focus &&
            canvasObjects.focus.updates[canvasObjects.focusedText]
              ? canvasObjects.focus.updates[canvasObjects.focusedText].setting[
                  "handed"
                ]
              : "left"
          }
        >
          <FormControlLabel value="left" control={<Radio />} label="left" />
          <FormControlLabel value="right" control={<Radio />} label="right" />
          <FormControlLabel value="none" control={<Radio />} label="none" />
          {/* <FormControlLabel
            value="both"
            disabled
            control={<Radio />}
            label="both"
          />
          <FormControlLabel
            value="disabled"
            disabled
            control={<Radio />}
            label="random"
          /> */}
        </RadioGroup>
      </FormControl>
    </div>
  );
}

/////////////////////////////////////////////////////
////////////////// After Selection ///////////////////
/////////////////////////////////////////////////////

function AfterEnterSelection(props) {
  const handleChange = (e) => {
    canvasObjects.focus.changeEnterSetting("after", e.target.value);
    canvasObjects.rerenderConfig();
  };
  return (
    <div className="config-section">
      <FormControl>
        <FormLabel id="after-enter-selection">after enter:</FormLabel>
        <RadioGroup
          row
          aria-labelledby="after-enter-row-radio-buttons-group-label"
          name="after-enter-control"
          onChange={handleChange}
          defaultValue={
            canvasObjects.focus
              ? canvasObjects.focus.enterSetting["after"]
              : "stay"
          }
        >
          <FormControlLabel value="stay" control={<Radio />} label="stay" />
          {/* <FormControlLabel
            value="floating"
            control={<Radio />}
            label="floating"
          /> */}
          {/* <FormControlLabel
            value="following"
            control={<Radio />}
            label="following"
          /> */}
          <FormControlLabel value="exit" control={<Radio />} label="exit" />
        </RadioGroup>
      </FormControl>
    </div>
  );
}

function AfterUpdateSelection(selectedText) {
  const handleChange = (e) => {
    // console.log("change template animation");
    canvasObjects.focus.changeUpdateSetting("after", e.target.value);
    canvasObjects.rerenderConfig();
  };
  return (
    <div className="config-section">
      <FormControl>
        <FormLabel id="after-enter-selection">after update:</FormLabel>
        <RadioGroup
          row
          aria-labelledby="after-enter-row-radio-buttons-group-label"
          name="after-enter-control"
          onChange={handleChange}
          defaultValue={
            canvasObjects.focus &&
            canvasObjects.focus.updates[canvasObjects.focusedText]
              ? canvasObjects.focus.updates[canvasObjects.focusedText].setting[
                  "after"
                ]
              : "stay"
          }
        >
          <FormControlLabel value="stay" control={<Radio />} label="stay" />
          {/* <FormControlLabel
            value="floating"
            control={<Radio />}
            label="floating"
          /> */}
          {/* <FormControlLabel
            value="following"
            control={<Radio />}
            label="following"
          /> */}
          <FormControlLabel value="exit" control={<Radio />} label="exit" />
          <FormControlLabel value="back" control={<Radio />} label="back" />
          {/* <FormControlLabel value="yoyo" control={<Radio />} label="yoyo" />
          <FormControlLabel value="repeat" control={<Radio />} label="repeat" /> */}
        </RadioGroup>
      </FormControl>
    </div>
  );
}

///////////////////////////////////////////////////////
////////////////// Effect Selection ///////////////////
///////////////////////////////////////////////////////

function EnterTemplateSelection(props) {
  const handleChange = (e) => {
    canvasObjects.focus.changeEnterSetting("effect", e.target.value);
    canvasObjects.rerenderConfig();
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
          defaultValue={
            canvasObjects.focus
              ? canvasObjects.focus.enterSetting["effect"]
              : "appear"
          }
        >
          <FormControlLabel value="appear" control={<Radio />} label="appear" />
          <FormControlLabel
            value="float"
            control={<Radio />}
            label="float up"
          />
          <FormControlLabel value="zoom" control={<Radio />} label="zoom in" />
          {/* <FormControlLabel
            value="sketch"
            control={<Radio />}
            label="sketching"
          /> */}
          <FormControlLabel
            value="customize"
            control={<Switch />}
            label="customize"
            onChange={handleCustomizationEnter}
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
}

function UpdateTemplateSelection(selectedText) {
  const handleChange = (e) => {
    canvasObjects.focus.changeUpdateSetting("effect", e.target.value);
    canvasObjects.rerenderConfig();
    canvasObjects.focus.update();
  };
  // useEffect(() => {
  //   console.log(canvasObjects.focus.updates);
  //   console.log(canvasObjects.focusedText);
  //   console.log(
  //     canvasObjects.focus.updates[canvasObjects.focusedText].setting["effect"]
  //   );
  // });
  return (
    <div className="config-section">
      <FormControl>
        <FormLabel id="update-template-selection">update effect:</FormLabel>
        <RadioGroup
          row
          aria-labelledby="update-template-row-radio-buttons-group-label"
          name="update-template-control"
          onChange={handleChange}
          defaultValue={
            canvasObjects.focus &&
            canvasObjects.focus.updates[canvasObjects.focusedText]
              ? canvasObjects.focus.updates[canvasObjects.focusedText].setting[
                  "effect"
                ]
              : "transform"
          }
        >
          <FormControlLabel
            value="transform"
            control={<Radio />}
            label="transform to"
          />
          <FormControlLabel
            value="follow"
            control={<Radio />}
            label="hand follow"
          />
          <FormControlLabel value="seesaw" control={<Radio />} label="seesaw" />
          <FormControlLabel value="exit" control={<Radio />} label="exit" />
          {/* <FormControlLabel
            value="customize"
            control={<Radio />}
            label="customize"
            onChange={handleCustomizationUpdate}
          /> */}
          <FormControlLabel
            value="customize"
            control={<Switch />}
            label="customize"
            onChange={handleCustomizationUpdate}
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

export {
  InfoBadge,
  GraphicParamBox,
  HandedSelection,
  AfterEnterSelection,
  EnterTemplateSelection,
  TimelineSection,
  UpdateHandedSelection,
  UpdateTemplateSelection,
  AfterUpdateSelection,
  Thumbnail,
};
