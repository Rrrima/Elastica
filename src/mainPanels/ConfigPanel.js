import React, { useEffect, useState } from "react";
import EnterConfigPanel from "./EnterConfigPanel";
import UpdateConfigPanel from "./UpdateConfigPanel";

export default function ConfigPanel(props) {
  const [selectedText, setSelection] = useState(props.selectedText);
  const [status, setStatus] = useState("enter");
  const editor = props.editor;
  useEffect(() => {
    if (selectedText !== props.selectedText) {
      console.log(selectedText);
      console.log(editor);
    }
  }, [props.selectedText]);
  // if (props.selectedText) {
  //   setSelection(props.selectedText);
  // }
  return (
    <div className="main-panel" id="config-panel">
      {status === "enter" && (
        <EnterConfigPanel selectedText={selectedText} editor={editor} />
      )}
      {status === "update" && <UpdateConfigPanel selectedText={selectedText} />}
    </div>
  );
}
