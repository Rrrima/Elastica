import { createRoot } from "react-dom/client";
import ConfigPanel from "../mainPanels/ConfigPanel";
import { canvasObjects } from "../global";
import { objectDict } from "../resources/ObjectDict";

export default class EnterMarkerTool {
  static get isInline() {
    return true;
  }

  get state() {
    return this._state;
  }

  set state(state) {
    this._state = state;
    this.button.classList.toggle(this.api.styles.inlineToolButtonActive, state);
  }

  constructor({ api }) {
    this.api = api;
    this.button = null;
    this._state = false;
    this.tag = "MARK";
    this.class = "enter-marker";
  }

  render() {
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.innerHTML =
      '<svg data-name="Layer 1" id="Layer_1" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><title/><path d="M22.28,11.75a2.54,2.54,0,0,0,.6-2.56,2.43,2.43,0,0,0-1.95-1.7l-4.44-.66a.47.47,0,0,1-.36-.27l-2-4.17A2.39,2.39,0,0,0,12,1h0A2.37,2.37,0,0,0,9.83,2.4l-2,4.18a.46.46,0,0,1-.36.27l-4.43.69a2.4,2.4,0,0,0-1.94,1.7,2.53,2.53,0,0,0,.61,2.56L5,15.05a.49.49,0,0,1,.14.43l-.75,4.6a2.53,2.53,0,0,0,1,2.44,2.3,2.3,0,0,0,1.4.48,2.4,2.4,0,0,0,1.13-.29l4-2.18a.45.45,0,0,1,.45,0l4,2.16a2.33,2.33,0,0,0,2.53-.2,2.55,2.55,0,0,0,1-2.45l-.77-4.59a.51.51,0,0,1,.13-.44Zm-4.56,1.83A2.58,2.58,0,0,0,17,15.79l.77,4.6a.48.48,0,0,1-.18.48.46.46,0,0,1-.5,0l-4-2.16a2.34,2.34,0,0,0-2.24,0l-4,2.18a.46.46,0,0,1-.5,0,.47.47,0,0,1-.19-.48L7,15.82a2.58,2.58,0,0,0-.69-2.21L3.08,10.36A.49.49,0,0,1,3,9.86a.48.48,0,0,1,.39-.34l4.43-.68A2.4,2.4,0,0,0,9.58,7.47l2-4.19A.46.46,0,0,1,12,3a.46.46,0,0,1,.43.27l2,4.18a2.43,2.43,0,0,0,1.81,1.36l4.44.66a.45.45,0,0,1,.38.33.48.48,0,0,1-.12.51Z"/></svg>';
    // '<svg width="20" height="18" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h48v48h-48z" fill="none"/><path d="M12 6h-6v6c3.31 0 6-2.69 6-6zm16 0h-4c0 9.94-8.06 18-18 18v4c12.15 0 22-9.85 22-22zm-8 0h-4c0 5.52-4.48 10-10 10v4c7.73 0 14-6.27 14-14zm0 36h4c0-9.94 8.06-18 18-18v-4c-12.15 0-22 9.85-22 22zm16 0h6v-6c-3.31 0-6 2.69-6 6zm-8 0h4c0-5.52 4.48-10 10-10v-4c-7.73 0-14 6.27-14 14z"/></svg>';
    this.button.classList.add(this.api.styles.inlineToolButton);
    return this.button;
  }

  surround(range) {
    if (this.state) {
      this.unwrap(range);
      return;
    }
    this.wrap(range);
  }

  wrap(range) {
    const selectedText = range.extractContents();
    const mark = document.createElement(this.tag);
    mark.classList.add(this.class);
    mark.appendChild(selectedText);
    range.insertNode(mark);
    this.api.selection.expandToTag(mark);
    this.triggerSearch(mark);
  }

  unwrap(range) {
    const mark = this.api.selection.findParentTag(this.tag, this.class);
    const text = range.extractContents();
    mark.remove();
    range.insertNode(text);
  }

  checkState() {
    const mark = this.api.selection.findParentTag(this.tag);
    this.state = !!mark;
  }

  triggerSearch(mark) {
    const container = document.getElementById("configContainer");
    const root = createRoot(container);
    const curText = mark.innerHTML.trim().toLowerCase();
    canvasObjects.focusedText = curText;
    root.render(<ConfigPanel selectedText={curText} status={"enter"} />);
    mark.addEventListener("click", () => {
      canvasObjects.focusedText = curText;
      if (canvasObjects.objectDict[curText]) {
        // set focus to one of the object added to the screen
        canvasObjects.setFocus(canvasObjects.objectDict[curText][0]);
      } else {
        canvasObjects.setFocus(null);
      }
    });
  }
}
