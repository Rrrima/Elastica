import AdaGraphicConfig from "./AdaGraphicConfig";
import { canvasObjects } from "../../global";

export default function TextGraphicConfig(props) {
  const selectedText = props.selectedText;
  const status = props.status;
  return (
    <div>
      <div>Config graphic elements here:</div>
      {canvasObjects.getEnterObjects() && (
        <div className="text-graphic-container">
          {canvasObjects.getEnterObjects().map((item) => (
            <AdaGraphicConfig
              key={item.objectId}
              objectId={item.objectId}
              selectedText={item.relatedText}
              status={"enter"}
            />
          ))}
        </div>
      )}
      {canvasObjects.getUpdateObjects() && (
        <div className="text-graphic-container">
          {canvasObjects.getUpdateObjects().map((item) => (
            <AdaGraphicConfig
              key={canvasObjects.idDict[item].objectId}
              objectId={canvasObjects.idDict[item].objectId}
              selectedText={canvasObjects.idDict[item].relatedText}
              status={"update"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
