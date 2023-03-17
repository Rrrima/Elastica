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

export default function AdaGraphicConfig(props) {
  const selectedText = props.selectedText;
  const status = props.status;
  return (
    <div>
      {status === "enter" && (
        <Accordion>
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
        <Accordion>
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
