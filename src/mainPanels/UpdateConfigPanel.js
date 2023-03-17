import { Chip } from "@mui/material";
import { canvasObjects } from "../global";

export default function UpdateConfigPanel(props) {
  const selectedText = props.selectedText;
  return (
    <div>
      <h4>
        UPDATE for <Chip className={"update-chip"} label={selectedText} />
      </h4>
    </div>
  );
}
