import type { ComponentConfig } from "@measured/puck";
import type { Props } from "@blockTypes";

export const Hero: ComponentConfig<Props["Hero"]> = {
  fields: {
    title: { type: "text" },
    bgImage: { type: "text" },
    padding: { type: "number", min: 0, max: 200 },
    textColor: { type: "text" }, // e.g., "white" or "#ff0000"
    alignment: {
      type: "radio",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
  },
  defaultProps: {
    title: "Hello World",
    bgImage: "https://via.placeholder.com/1200x600",
    padding: 64,
    textColor: "white",
    alignment: "center",
  },
  render: ({ title, bgImage, padding, textColor, alignment }) => (
    <div
      // Dynamic Tailwind Classes
      className={`relative w-full bg-cover bg-no-repeat flex flex-col justify-center text-${alignment} p-[${padding}px] text-[${textColor}]`}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/50 z-0 pointer-events-none"></div>
      <h1 className="relative z-10 text-4xl font-bold drop-shadow-lg">
        {title}
      </h1>
    </div>
  ),
};
