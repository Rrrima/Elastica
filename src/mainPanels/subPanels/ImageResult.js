import PhotoSizeSelectActualIcon from "@mui/icons-material/PhotoSizeSelectActual";
import Stitch from "../../resources/Images/stitch.png";
import Stitch2 from "../../resources/Images/stitch2.png";

export default function ImageResult(props) {
  const selectedText = props.selectedText;
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
        <div className="image-item search-return-item" id="image-item1">
          <img src={Stitch} alt="test" />
        </div>
        <div className="image-item search-return-item" id="image-item2">
          <img src={Stitch2} alt="test2" />
        </div>
      </div>
    </div>
  );
}
