import { InfoBadge, GraphicParamBox } from "../../widgets/configWidgets";
import { objectDict } from "../../resources/ObjectDict";
export default function AdaGraphicConfig(props) {
  const selectedText = props.selectedText;
  const status = props.status;
  return (
    <div>
      <InfoBadge status={status} selectedText={selectedText} />
      <GraphicParamBox status={status} selectedText={selectedText} />
    </div>
  );
}
