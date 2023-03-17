import React, { Component, useEffect, useState } from "react";
import EnterConfigPanel from "./EnterConfigPanel";
import UpdateConfigPanel from "./UpdateConfigPanel";
import { canvasObjects } from "../global";

export default function ConfigPanel(props) {
  const [selectedText, setSelection] = useState(props.selectedText);
  const [status, setStatus] = useState(props.status);

  useEffect(() => {
    if (selectedText !== props.selectedText) {
      console.log(status, " ---- ", selectedText);
    }
  }, [props]);
  // if (props.selectedText) {
  //   setSelection(props.selectedText);
  // }

  return (
    <div className="main-panel" id="config-panel">
      {status === "enter" && <EnterConfigPanel selectedText={selectedText} />}
      {status === "update" && <UpdateConfigPanel selectedText={selectedText} />}
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
