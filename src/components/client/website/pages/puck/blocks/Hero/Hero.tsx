import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "@/components/client/website/pages/puck/blocks/types";
import {
  ResponsiveOptionButtonGroup,
  getResponsiveClasses,
} from "../shared/ResponsiveControls";

export const Hero: ComponentConfig<Props["Hero"]> & { icon?: string } = {
  label: "Hero",
  icon: "lucide:image",
  fields: {
    title: { type: "text" },
    bgImage: { type: "text" },
    padding: { type: "number", min: 0, max: 200 },
    textColor: { type: "text" }, // e.g., "white" or "#ff0000"
    alignment: {
      type: "custom",
      render: ({ field, value, onChange }) => (
        <ResponsiveOptionButtonGroup
          label={field.label || ""}
          value={value}
          onChange={onChange}
          defaultValue="center"
          options={[
            {
              label: "Left",
              value: "left",
              icon: "material-symbols-light:format-align-left-rounded",
            },
            {
              label: "Center",
              value: "center",
              icon: "material-symbols-light:format-align-center-rounded",
            },
            {
              label: "Right",
              value: "right",
              icon: "material-symbols-light:format-align-right-rounded",
            },
          ]}
        />
      ),
    },
  },
  defaultProps: {
    title: "Hello World",
    bgImage: "https://via.placeholder.com/1200x600",
    padding: 64,
    textColor: "white",
    alignment: {
      mobile: "center",
    },
  },
  render: ({ title, bgImage, padding, textColor, alignment }) => {
    const alignmentClasses = getResponsiveClasses(alignment, "text-");

    return (
      <div
        className={`relative w-full bg-cover bg-no-repeat flex flex-col justify-center ${alignmentClasses}`}
        style={{ backgroundImage: `url(${bgImage})`, padding: `${padding}px`, color: textColor }}
      >
        <div className="absolute inset-0 bg-black/50 z-0 pointer-events-none"></div>
        <h1 className="relative z-10 text-4xl font-bold drop-shadow-lg">
          {title}
        </h1>
      </div>
    );
  },
};
