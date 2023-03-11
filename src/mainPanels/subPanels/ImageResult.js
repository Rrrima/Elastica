import PhotoSizeSelectActualIcon from "@mui/icons-material/PhotoSizeSelectActual";
import Stitch from "../../resources/Images/stitch.png";
import Stitch2 from "../../resources/Images/stitch2.png";
import { fabric } from "fabric";
import { canvasObjects } from "../../global";
import { ImageObject } from "../../widgets/ObjectType";

export default function ImageResult(props) {
  const selectedText = props.selectedText;
  const editor = canvasObjects.canvas;

  function handleSelection(e) {
    const target = e.target;
    console.log(target);
    fabric.Image.fromURL(Stitch, (image) => {
      // console.log(image);
      image.scale(0.2);
      image.set({ left: 200, top: 100 });
      const newFab = new ImageObject(editor, selectedText, image);
      canvasObjects.addToDict(selectedText, newFab);
      canvasObjects.setFocus(newFab);
      console.log(" ======  object Dict =======");
      console.log(canvasObjects.objectDict);
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
      <div className="search-content-container" id="image-content-container">
        <div
          className="image-item search-return-item"
          id="image-item1"
          onClick={handleSelection}
        >
          <img src={Stitch} alt="test" />
        </div>
        <div
          className="image-item search-return-item"
          id="image-item2"
          onClick={handleSelection}
        >
          <img src={Stitch2} alt="test2" />
        </div>
      </div>
    </div>
  );
}
