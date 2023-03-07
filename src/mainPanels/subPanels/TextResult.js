import TextFieldsIcon from "@mui/icons-material/TextFields";
// import { handleSelection } from "../../functions/canvas";
export default function TextResult(props) {
  const selectedText = props.selectedText;
  const editor = props.editor;
  function handleSelection(e) {
    const target = e.target;
    console.log(target.id);
  }
  return (
    <div className="result-container">
      <div className="icon-caption">
        <div className="caption-icon">
          <TextFieldsIcon fontSize="small" className="indicateIcon" />{" "}
        </div>
        <div className="caption-text">text</div>
      </div>
      <div className="search-content-container" id="text-content-container">
        <div
          className="text-item search-return-item"
          id="text-item1"
          onClick={handleSelection}
        >
          {selectedText}
        </div>
        <div
          className="text-item search-return-item"
          id="text-item2"
          onClick={handleSelection}
        >
          {selectedText}
        </div>
        <div
          className="text-item search-return-item"
          id="text-item3"
          onClick={handleSelection}
        >
          {selectedText}
        </div>
        <div
          className="text-item search-return-item"
          id="text-item4"
          onClick={handleSelection}
        >
          {selectedText}
        </div>
      </div>
    </div>
  );
}
