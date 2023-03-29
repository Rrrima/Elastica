import PhotoSizeSelectActualIcon from "@mui/icons-material/PhotoSizeSelectActual";

import { fabric } from "fabric";
import { canvasObjects } from "../../global";
import { ImageObject } from "../../widgets/ImageObject";
import IMDICT from "../../widgets/Images";

export default function ImageResult(props) {
  const selectedText = props.selectedText;
  const editor = canvasObjects.canvas;
  const imlist = IMDICT[selectedText];

  function handleSelection(e) {
    const target = e.target;
    const imid = parseInt(target.id.split("-")[1]);
    console.log(target);
    fabric.Image.fromURL(imlist[imid], (image) => {
      console.log(imid);
      image.scale(0.2);
      image.set({ left: 200, top: 100 });
      const newFab = new ImageObject(editor, selectedText, image);
      canvasObjects.addToDict(selectedText, newFab);
      canvasObjects.setFocus(newFab);
      // console.log(" ======  object Dict =======");
      // console.log(canvasObjects.objectDict);
    });
  }

  return (
    <div className="result-container">
      <div className="icon-caption">
        <div className="caption-icon">
          <PhotoSizeSelectActualIcon
            fontSize="small"
            className="indicateIcon"
          />{" "}
        </div>
        <div className="caption-text">image</div>
      </div>
      {imlist && (
        <div className="search-content-container" id="image-content-container">
          {imlist.map((item, idx) => (
            <div
              className="image-item search-return-item"
              id={"imageitem-" + idx}
              onClick={handleSelection}
            >
              <img src={item} id={"imageinner-" + idx} alt="imageresult" />
            </div>
          ))}

          {/* <div
          className="image-item search-return-item"
          id="image-item2"
          onClick={handleSelection}
        >
          <img src={Stitch2} alt="test2" />
        </div> */}
        </div>
      )}
    </div>
  );
}
