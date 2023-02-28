import React, { Component } from "react";
import EditorJS from "@editorjs/editorjs";
import EnterMarkerTool from "../widgets/enterMarker";
import UpdateMarkerTool from "../widgets/updateMarker";

export default class TextEditor extends Component {
  constructor(props) {
    super(props);
    this.editor = new EditorJS({
      holderId: "myScript",
      placeholder: "Write your awesome presentation script here OwO",
      tools: {
        Enter: {
          class: EnterMarkerTool,
          inlineToolbar: true,
        },
        update: {
          class: UpdateMarkerTool,
          inlineToolbar: true,
        },
      },
    });
  }
  render() {
    return <div className="textEditor" id="myScript"></div>;
  }
}
