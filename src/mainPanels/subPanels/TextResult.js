import TextFieldsIcon from "@mui/icons-material/TextFields";
import AnimationIcon from "@mui/icons-material/Animation";
import Grid from "@mui/material/Grid";

export default function TextResult(props) {
  const selectedText = props.selectedText;
  return (
    <div className="result-container">
      <div className="icon-caption">
        <div className="caption-icon">
          <TextFieldsIcon fontSize="small" className="indicateIcon" />{" "}
        </div>
        <div className="caption-text">text</div>
      </div>
      <div className="search-content-container" id="text-content-container">
        <div className="text-item search-return-item" id="text-item1">
          Ohana means family
        </div>
        <div className="text-item search-return-item" id="text-item2">
          Ohana means family
        </div>
        <div className="text-item search-return-item" id="text-item3">
          Ohana means family
        </div>
        <div className="text-item search-return-item" id="text-item4">
          Ohana means family
        </div>
      </div>
    </div>
  );
}
