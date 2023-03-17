import { Component } from "react";
import { canvasObjects } from "../global";

export default class OverallVisualPanel extends Component {
  constructor(props) {
    super(props);
    console.log(canvasObjects);
  }
  render() {
    return <div className="main-panel" id="overview-panel"></div>;
  }
}
