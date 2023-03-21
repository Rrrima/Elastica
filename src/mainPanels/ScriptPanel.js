import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";
import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";
import TextEditor from "./TextEditor";
import { useRef } from "react";
import { canvasObjects } from "../global";

export default function ScriptPanel(props) {
  const gCanvas = props.gCanvas;
  const textEditorRef = useRef(null);
  canvasObjects.textEditor = textEditorRef;

  return (
    <div className="main-panel" id="script-panel">
      <TextEditor gCanvas={gCanvas} ref={textEditorRef} />

      <div className="bottom right floatButton">
        <Stack direction="row">
          <IconButton aria-label="edit">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton aria-label="timeline">
            <ViewTimelineIcon fontSize="small" />
          </IconButton>
        </Stack>
      </div>
    </div>
  );
}
