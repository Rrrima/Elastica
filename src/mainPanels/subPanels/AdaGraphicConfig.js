import {
  InfoBadge,
  GraphicParamBox,
  HandedSelection,
  AfterEnterSelection,
  EnterTemplateSelection,
  TimelineSection,
  UpdateHandedSelection,
  UpdateTemplateSelection,
  AfterUpdateSelection,
} from "../../widgets/configWidgets";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { canvasObjects } from "../../global";

export default function AdaGraphicConfig(props) {
  const selectedText = props.selectedText;
  const status = props.status;
  const obj = canvasObjects.idDict[props.objectId];
  const handleExpand = (ep) => {
    canvasObjects.setSelection(obj);
  };
  return (
    <div>
      {status === "enter" && (
        <Accordion
          onChange={(e, ep) => {
            handleExpand(ep);
          }}
          id={props.objectId}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <InfoBadge status={status} selectedText={selectedText} />
          </AccordionSummary>
          {/* <GraphicParamBox status={status} selectedText={selectedText} /> */}
          <AccordionDetails>
            <EnterTemplateSelection
              status={status}
              selectedText={selectedText}
            />
            <HandedSelection status={status} selectedText={selectedText} />
            <AfterEnterSelection status={status} selectedText={selectedText} />
          </AccordionDetails>
          {/* <TimelineSection status={status} selectedText={selectedText} /> */}
        </Accordion>
      )}
      {status === "update" && (
        <Accordion
          onChange={(e, ep) => {
            handleExpand(ep);
          }}
          id={props.objectId}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <InfoBadge status={status} selectedText={selectedText} />
          </AccordionSummary>
          {/* <GraphicParamBox status={status} selectedText={selectedText} /> */}
          <AccordionDetails>
            <UpdateTemplateSelection
              status={status}
              selectedText={selectedText}
            />
            <UpdateHandedSelection
              status={status}
              selectedText={selectedText}
            />
            <AfterUpdateSelection status={status} selectedText={selectedText} />
          </AccordionDetails>
          {/* <TimelineSection status={status} selectedText={selectedText} /> */}
        </Accordion>
      )}
    </div>
  );
}
