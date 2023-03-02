import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import VideocamIcon from "@mui/icons-material/Videocam";
// import MicIcon from "@mui/icons-material/Mic";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'
import { fabric } from "fabric";
import Stitch from "../resources/Images/stitch.png";
import LottieFabric from "../LottieFabric";
import AnimatedHeart1 from "../resources/lotties/heart1.json";

import { objectDict } from "../resources/ObjectDict";

export default function VisualPanel() {

  const { editor, onReady } = useFabricJSEditor()

  React.useEffect(() => {
    if (!editor || !fabric || !editor.canvas.isEmpty()) {
      return;
    }
    fabric.Image.fromURL(
      Stitch,
      (image) => {
        const obj = editor.canvas.add(image);
        console.log(obj)
      }
    );
    const textbox = new fabric.Textbox('Ohana means family', {
      left: 50,
      top: 50,
      width: 150,
      fontSize: 20,
      fontFamily:'Impact'
    });
    editor.canvas.add(textbox);
    const fabricImage = new LottieFabric(AnimatedHeart1, {
          scaleX: 1,
        })
    editor.canvas.add(fabricImage)
  }, [editor?.canvas.isEmpty()])

  const onAddCircle = () => {
    editor?.addCircle()
  }
  const onAddRectangle = () => {
    editor?.addRectangle()
  }

  return (
    <div className="main-panel" id="visual-panel">
      <div>
        <button onClick={onAddCircle}>Add circle</button>
        <button onClick={onAddRectangle}>Add Rectangle</button>
        <FabricJSCanvas className="canvas-panel" onReady={onReady} />
      </div>
      <div className="bottom right">
        <Stack direction="row">
          <IconButton aria-label="videocam">
            <VideocamIcon fontSize="small" />
          </IconButton>
          <IconButton aria-label="scriptfollow">
            <AutoGraphIcon fontSize="small" className="color-primary" />
          </IconButton>
        </Stack>
      </div>
    </div>
  );
}
