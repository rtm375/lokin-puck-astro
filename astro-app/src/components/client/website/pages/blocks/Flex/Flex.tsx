import type { ComponentConfig, Slot } from "@measured/puck";
import type { Props } from "@blockTypes";

export const Flex: ComponentConfig<Props["Flex"]> = {
  fields: {
    direction: {
      label: "Direction",
      type: "radio",
      options: [
        { label: "Row", value: "row" },
        { label: "Column", value: "column" },
      ],
    },
    justifyContent: {
      label: "Justify Content",
      type: "radio",
      options: [
        { label: "Start", value: "start" },
        { label: "Center", value: "center" },
        { label: "End", value: "end" },
      ],
    },
    gap: {
      label: "Gap",
      type: "number",
      min: 0,
    },
    wrap: {
      label: "Wrap",
      type: "radio",
      options: [
        { label: "true", value: "wrap" },
        { label: "false", value: "nowrap" },
      ],
    },
    items: {
      type: "slot",
    },
  },
  defaultProps: {
    justifyContent: "start",
    direction: "row",
    gap: 24,
    wrap: "wrap",
    items: [],
  },
  render: ({ justifyContent, direction, gap, wrap, items: Items }) => {
    return (
      <div style={{ height: "100%" }}>
        <Items
          style={{
            justifyContent,
            flexDirection: direction,
            gap,
            flexWrap: wrap,
          }}
          disallow={["Hero", "Stats"]}
        />
      </div>
    );
  },
};
