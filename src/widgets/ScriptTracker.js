import { aniDriver } from "../global";

function wordCount(t) {
  t = t.trim();
  let l = t.match(/\b(\w|')+\b/g);
  if (l) {
    return l.length;
  } else {
    return 0;
  }
}

export default class ScriptTracker {
  constructor() {
    this.triggerWord = []; // the list of highlighted words
    this.triggerList = []; // the start of the affective window
    this.endList = []; // the end of the highlighted words (also the end of the affective window)
    this.wordIndexList = []; // the actual starting index of the highlighted words
    this.pointer = 0; // the index of the triggerList that is listening to
    this.triggerQ = [];
    this._n = 0; // length of triger words
    this.offset = 2;
  }
  addHighlight(prevText, text) {
    prevText = prevText.trim();
    let curText = text.trim();
    let curId = wordCount(prevText);
    let curSpan = wordCount(curText);
    let baseId = 0;
    if (this.triggerList.length > 0) {
      baseId = this.endList[this.endList.length - 1];
    }
    text = text.trim().toLowerCase();
    let textId = curId + baseId;
    let endId = textId + curSpan;
    this.triggerWord.push(text);
    this.wordIndexList.push(textId);
    this.endList.push(endId);
    if (curId < this.offset) {
      curId = this.offset;
    }
    let triggerId = curId + baseId - this.offset;
    this.triggerList.push(triggerId);
    this.triggerQ.push(false);
    this._n += 1;
    // this.log();
  }
  revertQ() {
    this.pointer = 0;
    this.triggerQ = this.triggerQ.map((x) => false);
  }
  log() {
    console.log(this.triggerWord);
    console.log(this.wordIndexList);
    console.log(this.triggerList);
    console.log(this.endList);
    console.log(this.pointer);
  }
  trackTo(curIndex) {
    console.log("current index:", curIndex);
    const _triggerWord = this.triggerWord;
    if (this.pointer < this._n) {
      // if not finished triggering all the words
      if (
        curIndex >= this.triggerList[this.pointer] &&
        !this.triggerQ[this.pointer]
      ) {
        console.log("pinter:", this.pointer);
        aniDriver.triggerAnimation(this.triggerWord[this.pointer]);
        this.triggerQ[this.pointer] = true;
        setTimeout(
          function (i) {
            aniDriver.forceEnd(_triggerWord[i]); // force to desired position
            if (this.pointer === i) {
              this.pointer += 1;
            }
          },
          1500,
          this.pointer
        );
      }
      if (curIndex >= this.endList[this.pointer] - 1) {
        aniDriver.forceEnd(this.triggerWord[this.pointer]); // force to desired position
        this.pointer += 1;
      }
    }
  }
}
