const inferVariableType = (value) => {
  if (!value) return "simple";
  if (value.includes("gradient") || value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl") || value === "transparent" || value === "currentColor") {
    return "color";
  }
  if (value.match(/^-?\d+(\.\d+)?(px|em|rem|%|vw|vh|ch|ex|vmin|vmax)?$/) || value === "auto" || value === "0") {
    return "length";
  }
  const parts = value.split(" ").filter(Boolean);
  if (parts.length >= 4) {
    if (parts.length === 4) return "text-shadow";
    return "box-shadow";
  }
  return "simple";
};
console.log(inferVariableType("10px"));
console.log(inferVariableType("20rem"));
console.log(inferVariableType("auto"));
console.log(inferVariableType("0"));
console.log(inferVariableType("#000000"));
