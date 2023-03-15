import TextFieldsIcon from "@mui/icons-material/TextFields";
import { fabric } from "fabric";
import { canvasObjects } from "../../global";
import { TextObject } from "../../widgets/ObjectType";

export default function TextResult(props) {
  const selectedText = props.selectedText;
  const editor = canvasObjects.canvas;
  const attr = { left: 50, top: 50, width: 150, fontSize: 20 };
  const styleMap = {
    "text-item1": "Impact",
    "text-item2": "Poppins",
    "text-item3": "Baloo Tamma 2",
    "text-item4": "Mynerve",
  };

  function handleSelection(e) {
    const target = e.target;
    const t = target.innerHTML;
    const style = styleMap[target.id];
    const textbox = new fabric.Textbox(t, {
      ...attr,
      fontFamily: style,
    });
    const newFab = new TextObject(editor, selectedText, textbox);
    canvasObjects.addToDict(selectedText, newFab);
    canvasObjects.setFocus(newFab);
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
