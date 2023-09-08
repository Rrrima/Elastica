import React, { Component } from "react";
import EditorJS from "@editorjs/editorjs";
import EnterMarkerTool from "../widgets/enterMarker";
import UpdateMarkerTool from "../widgets/updateMarker";

export default class TextEditor extends Component {
  constructor(props) {
    super(props);
    this.canvas = props.gCanvas;
    this.editor = new EditorJS({
      holderId: "myScript",
      placeholder: "Write your awesome presentation script here OwO",
      tools: {
        Animate: {
          class: EnterMarkerTool,
          inlineToolbar: true,
        },
        // update: {
        //   class: UpdateMarkerTool,
        //   inlineToolbar: true,
        // },
      },
      data: {
        blocks: [
          {
            type: "paragraph",
            data: {
              text: "This is the music staff, and the hi-hat, the snare drum and the bass drum sit in these positions on it.",
            },
          },
        ],
      },
    });
  }
  render() {
    return <div className="textEditor" id="myScript"></div>;
  }
}
