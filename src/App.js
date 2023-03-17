import "./App.css";
import Grid from "@mui/material/Grid";
import "./App.css";
import VisualPanel from "./mainPanels/VisualPanel";
import ScriptPanel from "./mainPanels/ScriptPanel";
import ConfigPanel from "./mainPanels/ConfigPanel";
import OverallVisualPanel from "./mainPanels/OverallVisualPanel";
import { useEffect, useRef } from "react";
import { fabric } from "fabric";
import Stitch from "./resources/Images/stitch.png";
import LottieFabric from "./LottieFabric";
import AnimatedHeart1 from "./resources/lotties/heart1.json";
import { useFabricJSEditor } from "fabricjs-react";
import gsap from "gsap";

function App() {
  const { editor, onReady } = useFabricJSEditor();
  let attr = { left: 50, top: 50, width: 150, fontSize: 20 };
  useEffect(() => {
    if (!editor || !fabric || !editor.canvas.isEmpty()) {
      return;
    }
    // fabric.Image.fromURL(Stitch, (image) => {
    //   image.scale(0.2);
    //   image = editor.canvas.add(image);
    // });
    // const textbox = new fabric.Textbox("Ohana means family", {
    //   ...attr,
    //   fontFamily: "Baloo Tamma 2",
    // });
    // gsap.to(attr, { left: 1000, top: 500, duration: 1.2 });
    // editor.canvas.add(textbox);
    // const fabricImage = new LottieFabric(AnimatedHeart1, {
    //   scaleX: 0.6,
    //   scaleY: 0.6,
    // });
    // editor.canvas.add(fabricImage);
    // console.log(attr);
    // setInterval(() => {
    //   textbox.set(attr);
    // }, 10);
  });
  return (
    <div className="App">
      <div id="page-header">
        <h3>
          <span id="titleHighlight">Script</span>Live
        </h3>
        <p>A script based author system with adaptive animation.</p>
      </div>
      <div className="container">
        <Grid container spacing={4}>
          <Grid item xs={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={0}>
                  <Grid item xs={2} id="overviewContainer">
                    <OverallVisualPanel />
                  </Grid>
                  <Grid item xs={12} id="canvasContainer">
                    <VisualPanel editor={editor} onReady={onReady} />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <ScriptPanel gCanvas={editor} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4} id="configContainer">
            <ConfigPanel selectedText="" status="enter" />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default App;
