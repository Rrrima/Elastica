import React, { useState } from "react";
import EnterConfigPanel from "./EnterConfigPanel";
import UpdateConfigPanel from "./UpdateConfigPanel";

export default function ConfigPanel(props) {
  const [selectedText, setSelection] = useState("stitch");
  const [status, setStatus] = useState("enter");
  return (
    <div className="main-panel" id="config-panel">
      {status === "enter" && <EnterConfigPanel selectedText={selectedText} />}
      {status === "update" && <UpdateConfigPanel selectedText={selectedText} />}
    </div>
  );
}
