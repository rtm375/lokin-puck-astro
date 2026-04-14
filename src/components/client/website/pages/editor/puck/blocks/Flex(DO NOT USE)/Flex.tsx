import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "@/components/client/website/pages/editor/puck/blocks/types";
import type { BreakpointKey } from "../../config/viewports";
import {
  ResponsiveOptionButtonGroup,
  ResponsiveGapControl,
  getResponsiveCSS,
  ResponsiveSpacingControl,
  tailwindToCSS,
  ResponsiveSliderControl,
} from "../shared/ResponsiveControls";

export const createFlexConfig = (
  t: (key: string) => string,
): ComponentConfig<Props["Flex"]> & { icon?: string } => ({
  icon: "lucide:layout-grid",
  label: t("editor.blocks.flex.title"),
  fields: {
    frame: {
      label: "Frame",
      type: "custom",
      render: ({ value, onChange }) => {
        const val = value || {};
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-neutral-700">
                Content Width
              </span>
              <select
                className="h-8 px-2 border border-neutral-200 rounded text-xs outline-none bg-white min-w-[120px]"
                value={val.contentWidth || "boxed"}
                onChange={(e) =>
                  onChange({ ...val, contentWidth: e.target.value as "boxed" | "full" })
                }
              >
                <option value="boxed">Boxed</option>
                <option value="full">Full Width</option>
              </select>
            </div>

            {val.contentWidth !== "full" && (
              <ResponsiveSliderControl
                label="Width"
                value={val.width || {}}
                onChange={(width) => onChange({ ...val, width })}
                units={["px", "%", "vw", "em", "rem"]}
                max={2000}
              />
            )}

            <ResponsiveSliderControl
              label="Min Height"
              value={val.minHeight || {}}
              onChange={(minHeight) => onChange({ ...val, minHeight })}
              units={["px", "vh", "em", "rem"]}
              max={1500}
              description="To achieve full height Container use 100vh."
            />

            <ResponsiveOptionButtonGroup
              label={t("editor.blocks.flex.direction.title")}
              value={val.direction || {}}
              onChange={(direction) => onChange({ ...val, direction })}
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
            <ResponsiveOptionButtonGroup
              label={t("editor.blocks.flex.justify_content.title")}
              value={val.justifyContent || {}}
              onChange={(justifyContent) => onChange({ ...val, justifyContent })}
              controlType="justify"
              directionData={val.direction}
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
            <ResponsiveOptionButtonGroup
              label={t("editor.blocks.flex.align.title")}
              value={val.alignItems || {}}
              onChange={(alignItems) => onChange({ ...val, alignItems })}
              controlType="align"
              directionData={val.direction}
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
            <ResponsiveGapControl
              label={t("editor.blocks.flex.gaps")}
              value={val.gaps || {}}
              onChange={(gaps) => onChange({ ...val, gaps })}
            />
            <ResponsiveOptionButtonGroup
              label={t("editor.blocks.flex.wrap.title")}
              value={val.wrap || {}}
              onChange={(wrap) => onChange({ ...val, wrap })}
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
            <ResponsiveSpacingControl
              label={t("editor.blocks.flex.margin")}
              value={val.margin || {}}
              onChange={(margin) => onChange({ ...val, margin })}
            />
            <ResponsiveSpacingControl
              label={t("editor.blocks.flex.padding")}
              value={val.padding || {}}
              onChange={(padding) => onChange({ ...val, padding })}
            />
          </div>
        );
      },
    },
    items: {
      label: t("editor.blocks.items.title"),
      type: "slot",
    },
  },
  resolveData: async ({ props }) => {
    let newProps = { ...props };
    let frame = newProps.frame ? JSON.parse(JSON.stringify(newProps.frame)) : {};

    const legacyProps = ["direction", "justifyContent", "alignItems", "gaps", "wrap", "margin", "padding"];
    legacyProps.forEach(prop => {
      if ((newProps as any)[prop] !== undefined) {
        frame[prop] = JSON.parse(JSON.stringify((newProps as any)[prop]));
        delete (newProps as any)[prop];
      }
    });

    const migrateToDesktop = (val: any) => {
      if (val && typeof val === "object" && val.mobile !== undefined && val.desktop === undefined) {
        const { mobile, ...rest } = val;
        return { ...rest, desktop: mobile };
      }
      return val;
    };

    frame.direction = migrateToDesktop(frame.direction);
    frame.justifyContent = migrateToDesktop(frame.justifyContent);
    frame.alignItems = migrateToDesktop(frame.alignItems);
    frame.wrap = migrateToDesktop(frame.wrap);

    if (frame.width) {
      frame.width = {
        value: migrateToDesktop(frame.width.value),
        unit: migrateToDesktop(frame.width.unit),
      };
    }

    if (frame.minHeight) {
      frame.minHeight = {
        value: migrateToDesktop(frame.minHeight.value),
        unit: migrateToDesktop(frame.minHeight.unit),
      };
    }

    if (typeof frame.gaps === "string" || !frame.gaps || typeof frame.gaps !== "object") {
      const oldGapVal: string = typeof frame.gaps === "string" ? frame.gaps : "gap-0";
      frame.gaps = {
        row: { desktop: oldGapVal === "custom" ? "custom" : oldGapVal },
        column: { desktop: oldGapVal === "custom" ? "custom" : oldGapVal },
        rowCustom: oldGapVal === "custom" ? { desktop: (newProps as any).gapCustom || 0 } : {},
        columnCustom: oldGapVal === "custom" ? { desktop: (newProps as any).gapCustom || 0 } : {},
        lock: true
      };
      if ("gapCustom" in newProps) {
        delete (newProps as any).gapCustom;
      }
    } else {
      frame.gaps = {
        ...frame.gaps,
        row: migrateToDesktop(frame.gaps.row),
        column: migrateToDesktop(frame.gaps.column),
        rowCustom: migrateToDesktop(frame.gaps.rowCustom),
        columnCustom: migrateToDesktop(frame.gaps.columnCustom),
        unit: migrateToDesktop(frame.gaps.unit),
      };
    }

    if (frame.margin) {
      frame.margin = {
        ...frame.margin,
        top: migrateToDesktop(frame.margin.top),
        right: migrateToDesktop(frame.margin.right),
        bottom: migrateToDesktop(frame.margin.bottom),
        left: migrateToDesktop(frame.margin.left),
        topCustom: migrateToDesktop(frame.margin.topCustom),
        rightCustom: migrateToDesktop(frame.margin.rightCustom),
        bottomCustom: migrateToDesktop(frame.margin.bottomCustom),
        leftCustom: migrateToDesktop(frame.margin.leftCustom),
        unit: migrateToDesktop(frame.margin.unit),
      };
    }

    if (frame.padding) {
      frame.padding = {
        ...frame.padding,
        top: migrateToDesktop(frame.padding.top),
        right: migrateToDesktop(frame.padding.right),
        bottom: migrateToDesktop(frame.padding.bottom),
        left: migrateToDesktop(frame.padding.left),
        topCustom: migrateToDesktop(frame.padding.topCustom),
        rightCustom: migrateToDesktop(frame.padding.rightCustom),
        bottomCustom: migrateToDesktop(frame.padding.bottomCustom),
        leftCustom: migrateToDesktop(frame.padding.leftCustom),
        unit: migrateToDesktop(frame.padding.unit),
      };
    }

    newProps.frame = frame;
    return { props: newProps };
  },
  defaultProps: {
    frame: {
      contentWidth: "boxed",
      width: {
        value: { desktop: 1240 },
        unit: { desktop: "px" }
      },
      minHeight: {
        value: { desktop: 50 },
        unit: { desktop: "vh" }
      },
      justifyContent: {},
      alignItems: {},
      direction: {},
      gaps: {
        row: { desktop: "gap-24" },
        column: { desktop: "gap-24" },
        lock: true
      },
      margin: { top: {}, right: {}, bottom: {}, left: {}, lock: true },
      padding: {
        top: { desktop: "pt-4" },
        right: { desktop: "pr-4" },
        bottom: { desktop: "pb-4" },
        left: { desktop: "pl-4" },
        lock: true
      },
      wrap: {},
    },
    items: []
  },
  inline: true,
  render: ({
    frame,
    items: Items,
    puck,
  }) => {
    const {
      contentWidth,
      width,
      minHeight,
      justifyContent,
      alignItems,
      direction,
      gaps,
      margin,
      padding,
      wrap,
    } = frame || {};

    const createEdgeConfig = (property: string, prefix: string, edge: "top" | "right" | "bottom" | "left", responsiveVal: any) => ({
      property,
      prefix,
      resolver: (bp: BreakpointKey) => {
        const val = responsiveVal?.[edge]?.[bp];
        if (!val) return null;
        if (val === "custom")
          return `${responsiveVal?.[`${edge}Custom`]?.[bp] ?? 0}${responsiveVal?.unit?.[bp] ?? "px"}`;
        const match = val.match(/space-(\d+)/);
        return match ? `${parseInt(match[1]) * 0.25}rem` : "0px";
      },
    });

    const { style: minHeightStyle, className: minHeightClass } = getResponsiveCSS([
      {
        property: "min-height",
        prefix: "f-mh",
        resolver: (bp) => {
          const v = minHeight?.value?.[bp];
          const u = minHeight?.unit?.[bp] || "px";
          if (v !== undefined && v !== "") return `${v}${u}`;
          return null;
        },
      }
    ]);

    const { style: styleVars, className: stableClasses } = getResponsiveCSS([
      {
        property: "max-width",
        prefix: "f-mw",
        resolver: (bp) => {
          if (contentWidth === "full") return "100%";
          const v = width?.value?.[bp];
          const u = width?.unit?.[bp] || "px";
          if (v !== undefined && v !== "") return `${v}${u}`;
          return null;
        },
      },
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
      createEdgeConfig("margin-top", "f-mt", "top", margin),
      createEdgeConfig("margin-right", "f-mr", "right", margin),
      createEdgeConfig("margin-bottom", "f-mb", "bottom", margin),
      createEdgeConfig("margin-left", "f-ml", "left", margin),
      createEdgeConfig("padding-top", "f-pt", "top", padding),
      createEdgeConfig("padding-right", "f-pr", "right", padding),
      createEdgeConfig("padding-bottom", "f-pb", "bottom", padding),
      createEdgeConfig("padding-left", "f-pl", "left", padding),
    ]);

    // Apply !important to each min-height class individually in editor mode,
    // so Puck's dropzone default min-height doesn't override ours.
    const minHeightClasses = puck.isEditing
      ? minHeightClass.trim().split(/\s+/).filter(Boolean).map((c) => `${c}!`).join(" ")
      : minHeightClass;

    return (
      <Items
        ref={puck.dragRef}
        style={{ ...minHeightStyle, ...styleVars }}
        as={"section"}
        className={`flex min-w-0 ${minHeightClasses} ${contentWidth === "boxed" ? "mx-auto" : ""} ${stableClasses}`}
        disallow={["Hero", "Stats"]}
      />
    );
  },
});