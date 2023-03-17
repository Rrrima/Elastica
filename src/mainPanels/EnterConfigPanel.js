// import AdaGraphicConfig from "./subPanels/AdaGraphicConfig";
import TextGraphicConfig from "./subPanels/TextGraphicConfig";
import Grid from "@mui/material/Grid";
import SearchPanel from "./subPanels/SearchPanel";
import Divider from "@mui/material/Divider";
import { TimelineSection } from "../widgets/configWidgets";
import { canvasObjects } from "../global";

export default function EnterConfigPanel(props) {
  const selectedText = props.selectedText;
  console.log(canvasObjects.getEnterObjects());
  console.log(canvasObjects.getUpdateObjects());
  return (
    <div id="config-panel">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SearchPanel selectedText={selectedText} />
        </Grid>
        <Grid item xs={12}>
          <Divider light />
        </Grid>
        <Grid item xs={12} id="graphic-config-container">
          <TimelineSection status={"enter"} selectedText={selectedText} />
          {/* <AdaGraphicConfig selectedText={selectedText} status={"enter"} />
          <AdaGraphicConfig selectedText={selectedText} status={"update"} /> */}
          <TextGraphicConfig selectedText={selectedText} status={"enter"} />
        </Grid>
      </Grid>
    </div>
  );
}
