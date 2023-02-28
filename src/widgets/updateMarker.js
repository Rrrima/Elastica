export default class UpdateMarkerTool {
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
    this.tag = "LINE";
    this.class = "update-marker";
  }

  render() {
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.innerHTML =
      '<svg id="Icons" style="enable-background:new 0 0 32 32;" version="1.1" viewBox="0 0 32 32" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style type="text/css">.st0{fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}</style><g><path d="M15,16H3c-0.6,0-1-0.4-1-1V3c0-0.6,0.4-1,1-1h12c0.6,0,1,0.4,1,1v12C16,15.6,15.6,16,15,16z"/></g><path d="M18,9v6c0,1.7-1.3,3-3,3H9c0,2.8,2.2,5,5,5h4c2.8,0,5-2.2,5-5v-4C23,11.2,20.8,9,18,9z"/><path d="M25,16.3V18c0,3.9-3.1,7-7,7h-1.7c0.9,2.9,3.5,5,6.7,5c3.9,0,7-3.1,7-7C30,19.8,27.9,17.2,25,16.3z"/></svg>';
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
}
