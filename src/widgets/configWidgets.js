import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { objectDict } from "../resources/ObjectDict";

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

function GraphicParamBox(props) {
  const { status, selectedText } = props;
  let params = {};
  if (status === "enter") {
    params = objectDict[selectedText][status];
  }
  console.log(status, params);
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

export { InfoBadge, GraphicParamBox };
