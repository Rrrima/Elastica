export default function GraphicParamConfig(props) {
  const selectedText = props.selectedText;
  const status = props.status;
  return (
    <div>
      {status} animation for {selectedText}
    </div>
  );
}
