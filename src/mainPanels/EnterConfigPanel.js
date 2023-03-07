import AdaGraphicConfig from "./subPanels/AdaGraphicConfig";
import Grid from "@mui/material/Grid";
import SearchPanel from "./subPanels/SearchPanel";
import Divider from "@mui/material/Divider";

export default function EnterConfigPanel(props) {
  const selectedText = props.selectedText;
  const editor = props.editor;
  return (
    <div id="config-panel">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SearchPanel selectedText={selectedText} editor={editor} />
        </Grid>
        <Grid item xs={12}>
          <Divider light />
        </Grid>
        <Grid item xs={12}>
          <AdaGraphicConfig selectedText={selectedText} status={"enter"} />
        </Grid>
      </Grid>
    </div>
  );
}
