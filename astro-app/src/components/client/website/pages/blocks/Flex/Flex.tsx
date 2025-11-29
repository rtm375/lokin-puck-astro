import type { ComponentConfig } from "@measured/puck";
import type { Props } from "@blockTypes";

export const createFlexConfig = (
  t: (key: string) => string,
): ComponentConfig<Props["Flex"]> => ({
  label: t("editor.blocks.flex.title"),
  fields: {
    minHeight: {
      label: t("editor.blocks.flex.min_height.title"),
      type: "select",
      options: [
        { label: "1/3 screen", value: "min-h-1/3" },
        { label: "2/3 screen", value: "min-h-2/3" },
        { label: "Full screen", value: "min-h-screen" },
        { label: "Default", value: "min-h-20" },
      ],
    },
    width: {
      label: t("editor.blocks.flex.width.title"),
      type: "select",
      options: [
        { label: "1/3 screen", value: "w-1/3" },
        { label: "2/3 screen", value: "w-2/3" },
        { label: "Full screen", value: "w-full" },
      ],
    },
    direction: {
      label: t("editor.blocks.flex.direction.title"),
      type: "radio",
      options: [
        { label: t("editor.blocks.flex.direction.row"), value: "flex-row" },
        { label: t("editor.blocks.flex.direction.column"), value: "flex-col" },
      ],
    },
    justifyContent: {
      label: t("editor.blocks.flex.justify_content.title"),
      type: "radio",
      options: [
        {
          label: t("editor.blocks.flex.justify_content.start"),
          value: "justify-start",
        },
        {
          label: t("editor.blocks.flex.justify_content.center"),
          value: "justify-center",
        },
        {
          label: t("editor.blocks.flex.justify_content.end"),
          value: "justify-end",
        },
        {
          label: t("editor.blocks.flex.justify_content.stretch"),
          value: "justify-stretch",
        },
      ],
    },
    gap: {
      label: t("editor.blocks.flex.gap"),
      type: "select",
      options: [
        { label: "None", value: "gap-0" },
        { label: "Small", value: "gap-2" },
        { label: "Medium", value: "gap-6" },
        { label: "Large", value: "gap-10" },
        { label: "Extra Large", value: "gap-14" },
        { label: "Custom", value: "custom" },
      ],
    },
    gapCustom: {
      label: t("editor.blocks.flex.gap_custom"),
      type: "number",
      min: 0,
      max: 100,
    },
    wrap: {
      label: t("editor.blocks.flex.wrap.title"),
      type: "radio",
      options: [
        { label: t("editor.blocks.flex.wrap.wrap"), value: "wrap" },
        { label: t("editor.blocks.flex.wrap.nowrap"), value: "nowrap" },
      ],
    },
    spacing: {
      type: "object",
      objectFields: {
        top: {
          type: "select",
          options: [
            {
              label: "Extra small",
              value: "pt-2",
            },
            {
              label: "Small",
              value: "pt-4",
            },
            {
              label: "Medium",
              value: "pt-6",
            },
            {
              label: "Large",
              value: "pt-8",
            },
            {
              label: "Extra Large",
              value: "pt-10",
            },
          ],
        },
        bottom: {
          type: "select",
          options: [
            {
              label: "Extra small",
              value: "pb-2",
            },
            {
              label: "Small",
              value: "pb-4",
            },
            {
              label: "Medium",
              value: "pb-6",
            },
            {
              label: "Large",
              value: "pb-8",
            },
            {
              label: "Extra Large",
              value: "pb-10",
            },
          ],
        },
      },
    },
    items: {
      label: t("editor.blocks.items.title"),
      type: "slot",
    },
  },
  resolveFields: async (data, { fields }) => {
    if (data.props.gap !== "custom") {
      return {
        ...fields,
        gapCustom: undefined,
      };
    }
    return fields;
  },
  resolveData: async ({ props }) => {
    if (props.gap !== "custom") {
      return {
        props: {
          gapCustom: 0,
        },
      };
    }
    return { props };
  },
  defaultProps: {
    minHeight: "h-20",
    width: "w-full",
    justifyContent: "justify-start",
    direction: "flex-row",
    gap: "gap-24",
    gapCustom: 0,
    wrap: "wrap",
    items: [],
    spacing: {
      top: "pt-2",
      bottom: "pb-2",
    },
  },
  render: ({
    minHeight,
    width,
    justifyContent,
    direction,
    gap,
    gapCustom,
    wrap,
    items: Items,
    spacing,
  }) => {
    return (
      <Items
        className={`flex ${justifyContent} ${direction} ${gap === "custom" ? `gap-${gapCustom}` : gap} ${wrap} ${spacing.top} ${spacing.bottom} ${minHeight} ${width}`}
        disallow={["Hero", "Stats"]}
      />
    );
  },
});
