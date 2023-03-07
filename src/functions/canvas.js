import VisualPanel from "../mainPanels/VisualPanel";
import { createRoot } from "react-dom/client";

function handleSelection(e) {
  let selection = e.target;
  //   const visualContainer = document.getElementById("canvasContainer");
  //   const visualRoot = createRoot(visualContainer);
  //   visualRoot.render(<VisualPanel element={selection} />);
  VisualPanel.addElement(selection);
}
export { handleSelection };
