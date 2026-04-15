import { type ComponentConfig, createUsePuck } from "@puckeditor/core";
import type { Props } from "../types";
import { useClassesStore } from "@/stores/useClassesStore";
import { ClassChips } from "../shared/ClassChips";
import { BreakpointPseudoSelector, type PseudoState } from "../shared/BreakpointPseudoSelector";
import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { type BreakpointKey, getInheritanceChain, mergeStyles, generateCSS, getCSSClassName } from "@/components/client/website/pages/editor/core/css-engine";
import { useEditorContext } from "@/components/client/website/pages/editor/core/editorProvider";
import { type Class } from "@/types";
import {
  ClassOptionGroup,
  ClassSizeControl,
  ClassBoxModelControl,
  ClassGapControl,
} from "../shared/ClassControls";

const baseBlockStyles = {
  normal: {
    desktop: {
      display: "flex",
      minHeight: "100px",
    }
  }
};

const Label = ({ children, overridden }: { children: React.ReactNode, overridden?: boolean }) => {
  return (
    <div className="flex items-center gap-1.5">
      <span className={overridden ? "line-through opacity-40" : ""}>
        {children}
      </span>
      {overridden && <Icon icon="lucide:lock" width={10} className="text-zinc-300" />}
    </div>
  );
};

const usePuck = createUsePuck();

export const createContainerConfig = (
  t: (key: string) => string,
): ComponentConfig<Props["Container"]> & { icon?: string } => ({
  icon: "lucide:layout-grid",
  label: "Container",
  fields: {
    classes: {
      label: "Applied Classes",
      type: "custom",
      render: ({ value, onChange }) => (
        <ClassChips value={value} onChange={onChange} />
      )
    },
    styles: {
      label: "Styles",
      type: "custom",
      render: ({ value: blockStyles, onChange }) => {
        const selectedItem = usePuck((s) => s.selectedItem);
        const hasItems = Array.isArray(selectedItem?.props?.items) && selectedItem.props.items.length > 0;

        const draftClasses = useClassesStore(state => state.draftClasses);
        const classes = useMemo(() => draftClasses || [], [draftClasses]);
        const activeClassId = useClassesStore(state => state.activeClassId);
        const updateClass = useClassesStore(state => state.updateClass);
        const editorContext = useEditorContext();
        const [activeBreakpoint, setActiveBreakpoint] = useState<BreakpointKey>("desktop");
        const [activePseudo, setActivePseudo] = useState<PseudoState>("normal");

        const activeClass = classes.find(c => c.id === activeClassId);

        // Calculate Style State
        const computed = useMemo(() => {
          const appliedIds = selectedItem?.props?.classes || [];
          const allChains = appliedIds.map((id: any) =>
            getInheritanceChain(id, classes)
          );

          const allMerged = mergeStyles(allChains, blockStyles || {}, baseBlockStyles);

          let overrides: any = {};
          if (!activeClassId) {
            overrides = mergeStyles(allChains, {}, {});
          } else {
            const idx = appliedIds.indexOf(activeClassId);
            const laterIds = appliedIds.slice(idx + 1);
            const laterChains = laterIds.map((id: any) =>
              getInheritanceChain(id, classes)
            );
            overrides = mergeStyles(laterChains, {}, {});
          }

          return {
            final: allMerged[activePseudo]?.[activeBreakpoint] || {},
            overrides: overrides[activePseudo]?.[activeBreakpoint] || {},
          };
        }, [selectedItem?.props?.classes, classes, blockStyles, activeClassId, activePseudo, activeBreakpoint]);

        const isOverridden = (prop: string) =>
          computed.overrides[prop] !== undefined;

        const isAnyOverridden = (...props: string[]) =>
          props.some(isOverridden);


        const applyUpdates = (baseStyles: any, updates: Record<string, any>) => {
          const newStyles = {
            ...baseStyles,
            [activePseudo]: {
              ...baseStyles?.[activePseudo],
              [activeBreakpoint]: {
                ...baseStyles?.[activePseudo]?.[activeBreakpoint],
              },
            },
          };

          const target = newStyles[activePseudo][activeBreakpoint];

          Object.entries(updates).forEach(([k, v]) => {
            if (v === "" || v === undefined) delete target[k];
            else target[k] = v;
          });

          return newStyles;
        };

        const handleUpdate = (updates: Record<string, any>) => {
          if (Object.keys(updates).some(isOverridden)) return;

          if (activeClassId && activeClass) {
            const newStyles = applyUpdates(activeClass.styles, updates);
            updateClass(activeClassId, { styles: newStyles });
            // Trigger editor's hasUnsavedChanges by marking class changes
            if (editorContext) {
              editorContext.setHasUnsavedChanges(true);
            }
          } else {
            const newStyles = applyUpdates(blockStyles, updates);
            onChange(newStyles);
          }
        };

        const sourceStyles = activeClass?.styles ?? blockStyles;

        const current =
          sourceStyles?.[activePseudo]?.[activeBreakpoint] || {};


        return (
          <div className="flex flex-col gap-4 border-t border-zinc-100 pt-3 mt-1">
            <BreakpointPseudoSelector
              activeBreakpoint={activeBreakpoint}
              setActiveBreakpoint={setActiveBreakpoint}
              activePseudo={activePseudo}
              setActivePseudo={setActivePseudo}
            />

            <div className="space-y-4">
              <ClassSizeControl
                label={<Label overridden={isOverridden("maxWidth")}>Width</Label>}
                value={current.maxWidth}
                onChange={(val: string) => handleUpdate({ maxWidth: val })}
                disabled={isAnyOverridden("maxWidth")}
                max={2000}
                description="Maximum width of the container content"
                cssProperty="maxWidth"
              />

              <ClassSizeControl
                label={<Label overridden={isOverridden("minHeight")}>Min Height</Label>}
                value={current.minHeight}
                onChange={(val: string) => handleUpdate({ minHeight: val })}
                disabled={isAnyOverridden("minHeight") || !hasItems}
                units={["px", "vh", "em", "rem"]}
                max={1500}
                description={
                  !hasItems
                    ? "Add content to the container before setting min height."
                    : "To achieve full height Container use 100vh."
                }
                cssProperty="minHeight"
              />

              <ClassBoxModelControl
                label={<Label overridden={isOverridden("marginTop")}>Spacing</Label>}
                values={current}
                onChange={handleUpdate}
                disabled={isAnyOverridden("marginTop", "marginRight", "marginBottom", "marginLeft", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft")}
                cssProperties={{
                  margin: {
                    top: "marginTop",
                    right: "marginRight",
                    bottom: "marginBottom",
                    left: "marginLeft"
                  },
                  padding: {
                    top: "paddingTop",
                    right: "paddingRight",
                    bottom: "paddingBottom",
                    left: "paddingLeft"
                  }
                }}
              />

              <ClassOptionGroup
                label={<Label overridden={isOverridden("display")}>Display</Label>}
                value={current.display}
                onChange={(val: string) => handleUpdate({ display: val })}
                disabled={isAnyOverridden("display")}
                options={[
                  { label: "Block", value: "block" },
                  { label: "Flex", value: "flex" },
                  { label: "Grid", value: "grid" },
                ]}
              />

              {(current.display || computed.final.display) !== "block" && (
                <>
                  <ClassOptionGroup
                    label={<Label overridden={isOverridden("flexDirection")}>Direction</Label>}
                    value={current.flexDirection}
                    onChange={(val: string) => handleUpdate({ flexDirection: val })}
                    disabled={isAnyOverridden("flexDirection")}
                    options={[
                      { label: "Row", value: "row", icon: "material-symbols-light:arrow-right-alt-rounded" },
                      { label: "Column", value: "column", icon: "material-symbols-light:arrow-downward-rounded" },
                      { label: "Row Reverse", value: "row-reverse", icon: "material-symbols-light:arrow-left-alt-rounded" },
                      { label: "Column Reverse", value: "column-reverse", icon: "material-symbols-light:arrow-upward-rounded" },
                    ]}
                  />
                  <ClassOptionGroup
                    label={<Label overridden={isOverridden("justifyContent")}>Justify</Label>}
                    value={current.justifyContent}
                    onChange={(val: string) => handleUpdate({ justifyContent: val })}
                    disabled={isAnyOverridden("justifyContent")}
                    controlType="justify"
                    direction={current.flexDirection || computed.final.flexDirection}
                    options={[
                      { label: "Start", value: "flex-start", icon: "material-symbols-light:align-justify-flex-start" },
                      { label: "Center", value: "center", icon: "material-symbols-light:align-justify-center" },
                      { label: "End", value: "flex-end", icon: "material-symbols-light:align-justify-flex-end" },
                      { label: "Between", value: "space-between", icon: "material-symbols-light:align-justify-space-between" },
                    ]}
                  />
                  <ClassOptionGroup
                    label={<Label overridden={isOverridden("alignItems")}>Align</Label>}
                    value={current.alignItems}
                    onChange={(val: string) => handleUpdate({ alignItems: val })}
                    disabled={isAnyOverridden("alignItems")}
                    controlType="align"
                    direction={current.flexDirection || computed.final.flexDirection}
                    options={[
                      { label: "Start", value: "flex-start", icon: "material-symbols-light:align-vertical-top" },
                      { label: "Center", value: "center", icon: "material-symbols-light:align-vertical-center" },
                      { label: "End", value: "flex-end", icon: "material-symbols-light:align-vertical-bottom" },
                      { label: "Stretch", value: "stretch", icon: "material-symbols-light:align-stretch" },
                    ]}
                  />
                  <ClassGapControl
                    label={<Label overridden={isOverridden("rowGap")}>Gaps</Label>}
                    values={current}
                    onChange={handleUpdate}
                    disabled={isAnyOverridden("rowGap", "columnGap")}
                    cssProperties={{
                      rowGap: "rowGap",
                      columnGap: "columnGap"
                    }}
                  />
                  <ClassOptionGroup
                    label={<Label overridden={isOverridden("flexWrap")}>Wrap</Label>}
                    value={current.flexWrap}
                    onChange={(val: string) => handleUpdate({ flexWrap: val })}
                    disabled={isAnyOverridden("flexWrap")}
                    options={[
                      { label: "Wrap", value: "wrap", icon: "lucide:wrap-text" },
                      { label: "No Wrap", value: "nowrap", icon: "lucide:arrow-right" },
                      { label: "Wrap Reverse", value: "wrap-reverse", icon: "lucide:undo-2" },
                    ]}
                  />
                </>
              )}
            </div>
          </div>
        );
      }
    },
    items: {
      label: t("editor.blocks.items.title"),
      type: "slot",
    },
  },
  defaultProps: {
    classes: [],
    styles: {},
    items: []
  },
  inline: true,
  render: ({ classes: appliedClassIds, styles: blockStyles, items: Items, puck, id }) => {
    const allClasses = useClassesStore(state => state.draftClasses || []);

    // 1. Get applied classes
    const appliedClasses = (appliedClassIds || [])
      .map(classId => allClasses.find((c: Class) => c.id === classId))
      .filter(Boolean) as Class[];

    // 2. Generate unique base class name for this block instance
    // Use the full id but make it CSS-safe
    const baseClassName = `LCLS_${id.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // 3. Generate CSS for base class ONLY (no merging with other classes)
    const baseCSS = blockStyles && Object.keys(blockStyles).length > 0
      ? generateCSS(`.${baseClassName}`, blockStyles)
      : generateCSS(`.${baseClassName}`, baseBlockStyles);

    // 4. Generate CSS for each applied class separately
    let classesCSS = "";
    appliedClasses.forEach(cls => {
      if (cls.styles && Object.keys(cls.styles).length > 0) {
        const className = getCSSClassName(cls);
        classesCSS += generateCSS(`.${className}`, cls.styles);
      }
    });

    // 5. Build class names string
    const sharedClassNames = appliedClasses
      .map(cls => getCSSClassName(cls))
      .join(" ");

    const finalClassName = [baseClassName, sharedClassNames].filter(Boolean).join(" ");

    // 6. Combine CSS in correct order: Base → Classes
    const finalCSS = baseCSS + classesCSS;

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: finalCSS }} />
        <Items
          ref={puck.dragRef}
          as={"section"}
          className={`${finalClassName}`}
        />
      </>
    );
  },
});
