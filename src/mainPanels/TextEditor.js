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
          // {
          //   type: "paragraph",
          //   data: {
          //     text: ''' ''',
          //   },
          // },
          {
            type: "paragraph",
            data: {
              text: `Let's talk about two important linguistic shapes. One is called bouba and another one is called kiki. So which is which? The pointy shape is kiki and the rounded shape is bouba. Studies found that the pointy shape is more associated with words such as 'pikas', which has invoiced plosives and front vowels. The round shape is more associated with words such as 'doodle', which has voiced plosives and back vowels.`,
            },
          },
          // {
          //   type: "paragraph",
          //   data: {
          //     text: "We present ScriptLive, a system for authoring augmented presentations directly using script annotations and gesture demonstration.  With these, ScriptLive generates animations that are adaptive to performance.",
          //   },
          // },
          // {
          //   type: "paragraph",
          //   data: {
          //     text: "How can we do this in AR? First, AR programming has a heavy use of realistic 3D models but we should also be able to work with simple 2D sketches. Also, to animate these objects, designers need to define curves, timings or even detailed keyframe animations. However, designer can simply enact animation with gesture in a similar way to the Wizard of Oz technique.",
          //   },
          // },
          // {
          //   type: "paragraph",
          //   data: {
          //     text: "In contrast to traditional video prototyping, where the scenario is recorded at the end. For AR, we need to record the scenario at the beginning to capture spatial properties of the environment.",
          //   },
          // },
        ],
      },
    });
  }
  render() {
    return <div className="textEditor" id="myScript"></div>;
  }
}
