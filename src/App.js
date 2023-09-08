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
// import LottieFabric from "./LottieFabric";
import AnimatedHeart1 from "./resources/lotties/heart1.json";
import { useFabricJSEditor } from "fabricjs-react";
import gsap from "gsap";
import useWindowDimensions from "./functions/useWindowDimensions";
import { canvasObjects } from "./global";

function App() {
  const { editor, onReady } = useFabricJSEditor();
  const { width, height } = useWindowDimensions();
  console.warn = console.error = () => {};
  let attr = { left: 50, top: 50, width: 150, fontSize: 20 };
  useEffect(() => {
    canvasObjects.canvasWidth = (height - 60) * 0.93;
    canvasObjects.canvasHeight = height - 60;
    const padding = (width - 90 - (height - 60) * 1.3) / 2;
    document.querySelector(".container").style.padding =
      "10px " + padding + "px";
    document.querySelector("#page-header").style.padding =
      "0px " + padding + "px";
    if (!editor || !fabric || !editor.canvas.isEmpty()) {
      return;
    }
  });
  return (
    <div className="App">
      <div id="page-header">
        <h3>
          <span id="titleHighlight">Script</span>Live
        </h3>
        <p>A script based authoring system with adaptive animation.</p>
      </div>
      <div className="container">
        <Grid container spacing={4}>
          <Grid item xs={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={0}>
                  <Grid item xs={2} id="overviewContainer">
                    {/* <OverallVisualPanel /> */}
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
