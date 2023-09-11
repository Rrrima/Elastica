import {
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
} from "../../widgets/configWidgets";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { canvasObjects } from "../../global";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Grid from "@mui/material/Grid";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Button from "@mui/material/Button";
import { aniDriver } from "../../global";

export default function AdaGraphicConfig(props) {
  const selectedText = props.selectedText;
  const status = props.status;
  const obj = canvasObjects.idDict[props.objectId];
  const handleExpand = () => {
    canvasObjects.setSelection(obj);
  };
  const triggerPreview = () => {
    // preview is triggered for focused object
    // console.log("preview on ", canvasObjects.focus);
    const t = canvasObjects.focus.getTimeThred();
    aniDriver.activeObjects = [canvasObjects.focus];
    aniDriver.preview();
    if (canvasObjects.canmeraOn) {
      canvasObjects.startPreview();
      setTimeout(() => {
        canvasObjects.endPreview();
      }, t * 2);
    }
  };

  const removeObject = () => {
    const curFocus = canvasObjects.focus;
    const curId = curFocus.objectId;
    curFocus.exitCanvas();
    // remove from obejctDict
    let newList = [];
    canvasObjects.objectDict[canvasObjects.focusedText].forEach((e) => {
      if (e.objectId !== curId) {
        newList.push(e);
      }
    });
    if (newList.length === 0) {
      newList = null;
    }
    canvasObjects.objectDict[canvasObjects.focusedText] = newList;
    // remove from updateDict
    if (canvasObjects.updateDict) {
      Object.keys(canvasObjects.updateDict).forEach((t) => {
        let newList2 = [];
        canvasObjects.updateDict[t].forEach((e) => {
          if (e !== curId) {
            newList2.push(e);
          }
        });
        if (newList2.length === 0) {
          newList2 = null;
        }
        canvasObjects.updateDict[t] = newList2;
      });
    }

    // remove from idDict
    delete canvasObjects.idDict[curId];
    canvasObjects.rerenderConfig();
  };
  const removeState = () => {
    const curFocus = canvasObjects.focus;
    const curText = canvasObjects.focusedText;
    const curId = curFocus.objectId;
    curFocus.revert();
    // remove from updateDict
    let newList2 = [];
    console.log(curId);
    canvasObjects.updateDict[canvasObjects.focusedText].forEach((e) => {
      if (e !== curId) {
        newList2.push(e);
      }
    });
    if (newList2.length === 0) {
      newList2 = null;
    }
    canvasObjects.updateDict[canvasObjects.focusedText] = newList2;
    // update object updates list
    delete curFocus.updates[curText];
    canvasObjects.rerenderConfig();
  };
  return (
    <div>
      {status === "enter" && (
        <Grid container spacing={0}>
          <Grid item xs={2}>
            <Thumbnail id={props.objectId} />
          </Grid>
          <Grid item xs={10}>
            <Accordion
              onChange={() => {
                handleExpand();
              }}
              id={props.objectId}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <InfoBadge
                  status={status}
                  selectedText={selectedText}
                  id={props.objectId}
                />
              </AccordionSummary>
              {/* <GraphicParamBox status={status} selectedText={selectedText} /> */}
              <AccordionDetails>
                <EnterTemplateSelection
                  status={status}
                  selectedText={selectedText}
                />
                <HandedSelection status={status} selectedText={selectedText} />
                {/* <AfterEnterSelection
                  status={status}
                  selectedText={selectedText}
                /> */}
                <IconButton
                  aria-label="playsingle"
                  className="playsingle-button"
                  onClick={triggerPreview}
                  disabled={canvasObjects.customizeMode}
                >
                  <PlayArrowIcon fontSize="small" />
                </IconButton>
                {canvasObjects.customizeMode ? "customization mode" : "preview"}
                <IconButton
                  aria-label="delete"
                  className="delete-button"
                  onClick={removeObject}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                delete object
              </AccordionDetails>
              {/* <TimelineSection status={status} selectedText={selectedText} /> */}
            </Accordion>
          </Grid>
        </Grid>
      )}
      {status === "update" && (
        <Grid container spacing={0}>
          <Grid item xs={2}>
            <Thumbnail id={props.objectId} />
          </Grid>
          <Grid item xs={10}>
            <Accordion
              onChange={(e, ep) => {
                handleExpand(ep);
              }}
              id={props.objectId}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <InfoBadge
                  status={status}
                  selectedText={selectedText}
                  id={props.objectId}
                />
              </AccordionSummary>
              {/* <GraphicParamBox status={status} selectedText={selectedText} /> */}
              <AccordionDetails>
                <UpdateTemplateSelection
                  status={status}
                  selectedText={selectedText}
                />
                <UpdateHandedSelection
                  status={status}
                  selectedText={selectedText}
                />
                <AfterUpdateSelection
                  status={status}
                  selectedText={selectedText}
                />
                <IconButton
                  aria-label="playsingle"
                  className="playsingle-button"
                  onClick={triggerPreview}
                  disabled={canvasObjects.customizeMode}
                >
                  <PlayArrowIcon fontSize="small" />
                </IconButton>
                {canvasObjects.customizeMode ? "customization mode" : "preview"}
                <IconButton aria-label="delete" onClick={removeState}>
                  <DeleteIcon />
                </IconButton>
                delete update
              </AccordionDetails>
              {/* <TimelineSection status={status} selectedText={selectedText} /> */}
            </Accordion>
          </Grid>
        </Grid>
      )}
    </div>
  );
}
