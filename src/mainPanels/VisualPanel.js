import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import VideocamIcon from "@mui/icons-material/Videocam";
// import MicIcon from "@mui/icons-material/Mic";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react'
import { fabric } from "fabric";
import LottieFabric from "../LottieFabric";

import { objectDict } from "../resources/ObjectDict";

export default function VisualPanel() {
  const { editor, onReady } = useFabricJSEditor();

  const renderTypes = (object) => {
    switch (object.type) {
      case 'image':
        fabric.Image.fromURL(
          object.renderData.imagePath,
          (image) => {
            editor.canvas.add(image);
          }
        );
        break;
      case 'text':
        const textbox = new fabric.Textbox(object.renderData.text, {
          left: 50,
          top: 50,
          width: 150,
          fontSize: object.renderData.fontSize,
          fontFamily: object.renderData.fontFamily
        });
        editor.canvas.add(textbox);
        break;
      case 'lottie':
        const fabricImage = new LottieFabric(object.renderData.jsonData, {
          scaleX: 1,
        })
        editor.canvas.add(fabricImage)
        break;
      default:
        console.log(`Unsupported object type ${object.type}.`);
    }    
  }

  React.useEffect(() => {
    if (!editor || !fabric || !editor.canvas.isEmpty()) {
      return;
    }
    for (const word in objectDict) {
      renderTypes(objectDict[word]);
    }    
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
