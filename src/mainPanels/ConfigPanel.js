import React, { useEffect, useState } from "react";
import EnterConfigPanel from "./EnterConfigPanel";
import { canvasObjects } from "../global";
import { createRoot } from "react-dom/client";

export default function ConfigPanel(props) {
  const [selectedText, setSelection] = useState(props.selectedText);
  // const [status, setStatus] = useState(props.status);
  useEffect(() => {
    if (selectedText !== props.selectedText) {
      setSelection(props.selectedText);
    }
    if (!canvasObjects.root) {
      const container = document.getElementById("configContainer");
      const root = createRoot(container);
      canvasObjects.root = root;
    }
    // if (props.selectedText) {
    //   setSelection(props.selectedText);
    // }
  }, [selectedText, props.selectedText]);

  return (
    <div className="main-panel" id="config-panel">
      <EnterConfigPanel selectedText={selectedText} />
      {/* {status === "update" && <UpdateConfigPanel selectedText={selectedText} />} */}
    </div>
  );
}

// export default class ConfigPanel extends Component {
//   constructor(props) {
//     super(props);
//     console.log(props);
//     this.status = "enter";
//     this.selectedText = props.selectedText;
//     this.editor = props.editor;
//     console.log(this.editor);
//   }
//   componentDidUpdate(prev) {
//     this.selectedText = this.props.selectedText;
//   }
//   render() {
//     return (
//       <div className="main-panel" id="config-panel">
//         {this.status === "enter" && (
//           <EnterConfigPanel
//             selectedText={this.selectedText}
//             editor={this.editor}
//           />
//         )}
//         {this.status === "update" && (
//           <UpdateConfigPanel selectedText={this.selectedText} />
//         )}
//       </div>
//     );
//   }
// }
