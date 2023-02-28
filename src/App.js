import "./App.css";

import Grid from "@mui/material/Grid";
import "./App.css";
import VisualPanel from "./mainPanels/VisualPanel";
import ScriptPanel from "./mainPanels/ScriptPanel";
import ConfigPanel from "./mainPanels/ConfigPanel";

function App() {
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
                <VisualPanel />
              </Grid>
              <Grid item xs={12}>
                <ScriptPanel />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <ConfigPanel />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default App;
