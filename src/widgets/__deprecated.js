function keyframeExtractor(e) {
  const attrNames = [
    "scaleX",
    "scaleY",
    "top",
    "left",
    "opacity",
    "dynamicMinWidth",
    "height",
  ];
  const target = e.target;
  let k = {};
  for (let i = 0; i < attrNames.length; i++) {
    k[attrNames[i]] = target[attrNames[i]];
  }
  return k;
}
