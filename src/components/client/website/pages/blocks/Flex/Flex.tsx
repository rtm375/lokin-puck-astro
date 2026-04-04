import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "@blockTypes";
import {
  ResponsiveOptionButtonGroup,
  ResponsiveGapControl,
  getResponsiveCSS,
  tailwindToCSS,
} from "../shared/ResponsiveControls";

export const createFlexConfig = (
  t: (key: string) => string,
): ComponentConfig<Props["Flex"]> => ({
  label: t("editor.blocks.flex.title"),
  fields: {
    direction: {
      label: t("editor.blocks.flex.direction.title"),
      type: "custom",
      render: ({ field, value, onChange }) => (
        <ResponsiveOptionButtonGroup
          label={field.label || ""}
          value={value}
          onChange={onChange}
          defaultValue="flex-row"
          options={[
            {
              label: t("editor.blocks.flex.direction.row"),
              value: "flex-row",
              icon: "material-symbols-light:arrow-right-alt-rounded",
            },
            {
              label: t("editor.blocks.flex.direction.column"),
              value: "flex-col",
              icon: "material-symbols-light:arrow-downward-rounded",
            },
            {
              label: t("editor.blocks.flex.direction.row_reverse"),
              value: "flex-row-reverse",
              icon: "material-symbols-light:arrow-left-alt-rounded",
            },
            {
              label: t("editor.blocks.flex.direction.column_reverse"),
              value: "flex-col-reverse",
              icon: "material-symbols-light:arrow-upward-rounded",
            },
          ]}
        />
      ),
    },
    justifyContent: {
      label: t("editor.blocks.flex.justify_content.title"),
      type: "custom",
      render: ({ field, value, onChange }) => (
        <ResponsiveOptionButtonGroup
          label={field.label || ""}
          value={value}
          onChange={onChange}
          controlType="justify"
          directionData={(field as any).directionData}
          options={[
            {
              label: t("editor.blocks.flex.justify_content.start"),
              value: "justify-start",
              icon: "material-symbols-light:align-justify-flex-start",
            },
            {
              label: t("editor.blocks.flex.justify_content.center"),
              value: "justify-center",
              icon: "material-symbols-light:align-justify-center",
            },
            {
              label: t("editor.blocks.flex.justify_content.end"),
              value: "justify-end",
              icon: "material-symbols-light:align-justify-flex-end",
            },
            {
              label: t("editor.blocks.flex.justify_content.between"),
              value: "justify-between",
              icon: "material-symbols-light:align-justify-space-between",
            },
            {
              label: t("editor.blocks.flex.justify_content.around"),
              value: "justify-around",
              icon: "material-symbols-light:align-justify-space-around",
            },
            {
              label: t("editor.blocks.flex.justify_content.evenly"),
              value: "justify-evenly",
              icon: "material-symbols-light:align-justify-space-even",
            },
          ]}
        />
      ),
    },
    alignItems: {
      label: t("editor.blocks.flex.align.title"),
      type: "custom",
      render: ({ field, value, onChange }) => (
        <ResponsiveOptionButtonGroup
          label={field.label || ""}
          value={value}
          onChange={onChange}
          controlType="align"
          directionData={(field as any).directionData}
          options={[
            {
              label: t("editor.blocks.flex.align.start"),
              value: "items-start",
              icon: "material-symbols-light:align-vertical-top",
            },
            {
              label: t("editor.blocks.flex.align.center"),
              value: "items-center",
              icon: "material-symbols-light:align-vertical-center",
            },
            {
              label: t("editor.blocks.flex.align.end"),
              value: "items-end",
              icon: "material-symbols-light:align-vertical-bottom",
            },
            {
              label: t("editor.blocks.flex.align.stretch"),
              value: "items-stretch",
              icon: "material-symbols-light:align-stretch",
            },
          ]}
        />
      ),
    },
    gaps: {
      label: t("editor.blocks.flex.gaps"),
      type: "custom",
      render: ({ field, value, onChange }) => (
        <ResponsiveGapControl
          label={field.label || ""}
          value={value}
          onChange={onChange}
        />
      ),
    },
    wrap: {
      label: t("editor.blocks.flex.wrap.title"),
      type: "custom",
      render: ({ field, value, onChange }) => (
        <ResponsiveOptionButtonGroup
          label={field.label || ""}
          value={value}
          onChange={onChange}
          options={[
            {
              label: t("editor.blocks.flex.wrap.wrap"),
              value: "flex-wrap",
              icon: "lucide:wrap-text",
            },
            {
              label: t("editor.blocks.flex.wrap.nowrap"),
              value: "flex-nowrap",
              icon: "lucide:arrow-right",
            },
            {
              label: t("editor.blocks.flex.wrap.wrap_reverse"),
              value: "flex-wrap-reverse",
              icon: "lucide:undo-2",
            },
          ]}
        />
      ),
    },
    items: {
      label: t("editor.blocks.items.title"),
      type: "slot",
    },
  },
  resolveFields: async (data, { fields }) => {
    let newFields = { ...fields };

    const direction = data.props.direction || {};
    const directionKey = JSON.stringify(direction);

    newFields.justifyContent = {
      ...newFields.justifyContent,
      type: "custom",
      key: `justify-${directionKey}`,
      directionData: direction,
    } as any;

    newFields.alignItems = {
      ...newFields.alignItems,
      type: "custom",
      key: `align-${directionKey}`,
      directionData: direction,
    } as any;

    return newFields;
  },
  resolveData: async ({ props }) => {
    let newProps = { ...props };
    // Migrate from the old string-based "gap" and "gapCustom"
    if (typeof newProps.gaps === "string" || !newProps.gaps || typeof newProps.gaps !== "object") {
      const oldGapVal: string = typeof newProps.gaps === "string" ? newProps.gaps : "gap-0";
      newProps.gaps = {
        row: { mobile: oldGapVal === "custom" ? "custom" : oldGapVal },
        column: { mobile: oldGapVal === "custom" ? "custom" : oldGapVal },
        rowCustom: oldGapVal === "custom" ? { mobile: (newProps as any).gapCustom || 0 } : {},
        columnCustom: oldGapVal === "custom" ? { mobile: (newProps as any).gapCustom || 0 } : {},
        lock: true
      };
      if ("gapCustom" in newProps) {
        delete (newProps as any).gapCustom;
      }
    }
    return { props: newProps };
  },
  defaultProps: {
    justifyContent: {
      mobile: "justify-start",
    },
    alignItems: {
      mobile: "items-stretch",
    },
    direction: {
      mobile: "flex-col",
      tablet: "flex-col",
      laptop: "flex-row",
      desktop: "flex-row",
    },
    gaps: {
      row: { mobile: "gap-24" },
      column: { mobile: "gap-24" },
      lock: true
    },
    wrap: {
      mobile: "flex-wrap",
    },
    items: []
  },
  render: ({
    justifyContent,
    alignItems,
    direction,
    gaps,
    wrap,
    items: Items,
  }) => {
    const { style: styleVars, className: stableClasses } = getResponsiveCSS([
      {
        property: "flex-direction",
        prefix: "f-dir",
        responsiveValue: direction,
        formatter: (v) => tailwindToCSS("direction", v),
      },
      {
        property: "justify-content",
        prefix: "f-jus",
        responsiveValue: justifyContent,
        formatter: (v) => tailwindToCSS("justify", v),
      },
      {
        property: "align-items",
        prefix: "f-ali",
        responsiveValue: alignItems,
        formatter: (v) => tailwindToCSS("align", v),
      },
      {
        property: "flex-wrap",
        prefix: "f-wrp",
        responsiveValue: wrap,
        formatter: (v) => tailwindToCSS("wrap", v),
      },
      {
        property: "row-gap",
        prefix: "f-rgap",
        resolver: (bp) => {
          const val = gaps?.row?.[bp];
          if (!val) return null;
          if (val === "custom")
            return `${gaps?.rowCustom?.[bp] ?? 0}${gaps?.unit?.[bp] ?? "px"}`;
          const match = val.match(/gap-(\d+)/);
          return match ? `${parseInt(match[1]) * 0.25}rem` : "0px";
        },
      },
      {
        property: "column-gap",
        prefix: "f-cgap",
        resolver: (bp) => {
          const val = gaps?.column?.[bp];
          if (!val) return null;
          if (val === "custom")
            return `${gaps?.columnCustom?.[bp] ?? 0}${gaps?.unit?.[bp] ?? "px"}`;
          const match = val.match(/gap-(\d+)/);
          return match ? `${parseInt(match[1]) * 0.25}rem` : "0px";
        },
      },
    ]);

    return (
      <div className={`flex flex-col`}>
        <Items
          style={styleVars}
          className={`flex w-full ${stableClasses}`}
          disallow={["Hero", "Stats"]}
        />
      </div>
    );
  },
});

