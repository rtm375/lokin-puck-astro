import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "../types";
import { useClassesStore } from "@/stores/useClassesStore";
import { ClassChips } from "../shared/ClassChips";
import { BreakpointPseudoSelector, type PseudoState } from "../shared/BreakpointPseudoSelector";
import { useState, useMemo, useId } from "react";
import { useParams } from "react-router-dom";
import { useWebsitesStore } from "@/stores/useWebsitesStore";
import { Icon } from "@iconify/react";
import { type BreakpointKey, getInheritanceChain, mergeStyles, generateCSS } from "@/lib/client/css-engine";
import {
  ClassSizeControl,
  ClassOptionGroup,
  ClassSpacingControl,
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
      render: ({ value: blockStyles, onChange, data }) => {
        const { subdomain } = useParams<{ subdomain: string }>();
        const { websites } = useWebsitesStore();
        const websiteId = websites.find((w) => w.subdomain === subdomain)?.id || "";

        const { activeClassId, classes, updateClass } = useClassesStore();
        const [activeBreakpoint, setActiveBreakpoint] = useState<BreakpointKey>("desktop");
        const [activePseudo, setActivePseudo] = useState<PseudoState>("normal");

        const activeClass = useMemo(() => classes.find(c => c.id === activeClassId), [classes, activeClassId]);

        // Calculate Style State
        const info = useMemo(() => {
          const appliedIds = data?.classes || [];
          const allChains = appliedIds.map(id => getInheritanceChain(id, classes));
          
          // 1. Final computed value (Everything merged)
          const allMerged = mergeStyles(allChains, blockStyles || {}, baseBlockStyles);
          
          // 2. Overrides (What is to the RIGHT of current selection)
          let overrides: any = {};
          if (!activeClassId) {
            // Base chip selected: everything in the class stack overrides us
            overrides = mergeStyles(allChains, {}, {});
          } else {
            // Class selected: only classes further to the RIGHT override us
            const idx = appliedIds.indexOf(activeClassId);
            const laterIds = appliedIds.slice(idx + 1);
            const laterChains = laterIds.map(id => getInheritanceChain(id, classes));
            overrides = mergeStyles(laterChains, {}, {});
          }

          return { 
            final: allMerged[activePseudo]?.[activeBreakpoint] || {},
            overrides: overrides[activePseudo]?.[activeBreakpoint] || {}
          };
        }, [activeClassId, data?.classes, blockStyles, classes, activePseudo, activeBreakpoint]);

        const isOverridden = (prop: string) => info.overrides[prop] !== undefined;

        const Label = ({ children, prop }: { children: React.ReactNode, prop?: string }) => {
          const overridden = prop && isOverridden(prop);
          return (
            <div className="flex items-center gap-1.5">
              <span className={overridden ? "line-through opacity-40" : ""}>
                {children}
              </span>
              {overridden && <Icon icon="lucide:lock" width={10} className="text-zinc-300" />}
            </div>
          );
        };

        const handleUpdate = (updates: Record<string, any>) => {
          // If any prop in updates is overridden from the right, ignore the whole update
          if (Object.keys(updates).some(isOverridden)) return;

          if (activeClassId && activeClass) {
            const newStyles = JSON.parse(JSON.stringify(activeClass.styles || {}));
            if (!newStyles[activePseudo]) newStyles[activePseudo] = {};
            if (!newStyles[activePseudo][activeBreakpoint]) newStyles[activePseudo][activeBreakpoint] = {};
            
            Object.entries(updates).forEach(([k, v]) => {
              if (v === "" || v === undefined) delete newStyles[activePseudo][activeBreakpoint][k];
              else newStyles[activePseudo][activeBreakpoint][k] = v;
            });
            updateClass(websiteId, activeClassId, { styles: newStyles });
          } else {
            const newStyles = JSON.parse(JSON.stringify(blockStyles || {}));
            if (!newStyles[activePseudo]) newStyles[activePseudo] = {};
            if (!newStyles[activePseudo][activeBreakpoint]) newStyles[activePseudo][activeBreakpoint] = {};
            
            Object.entries(updates).forEach(([k, v]) => {
              if (v === "" || v === undefined) delete newStyles[activePseudo][activeBreakpoint][k];
              else newStyles[activePseudo][activeBreakpoint][k] = v;
            });
            onChange(newStyles);
          }
        };

        const current = activeClassId && activeClass
          ? activeClass.styles?.[activePseudo]?.[activeBreakpoint] || {}
          : blockStyles?.[activePseudo]?.[activeBreakpoint] || {};

        return (
          <div className="flex flex-col gap-4 border-t border-zinc-100 pt-3 mt-1">
            <BreakpointPseudoSelector
              activeBreakpoint={activeBreakpoint}
              setActiveBreakpoint={setActiveBreakpoint}
              activePseudo={activePseudo}
              setActivePseudo={setActivePseudo}
            />

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <ClassSizeControl
                  label={<Label prop="maxWidth">Width</Label>}
                  value={current.maxWidth}
                  onChange={(val: string) => handleUpdate({ maxWidth: val })}
                  disabled={isOverridden("maxWidth")}
                />
                <ClassSizeControl
                  label={<Label prop="minHeight">Min Height</Label>}
                  value={current.minHeight}
                  onChange={(val: string) => handleUpdate({ minHeight: val })}
                  disabled={isOverridden("minHeight")}
                />
              </div>

              <ClassOptionGroup
                label={<Label prop="display">Display</Label>}
                value={current.display}
                onChange={(val: string) => handleUpdate({ display: val })}
                disabled={isOverridden("display")}
                options={[
                  { label: "Block", value: "block" },
                  { label: "Flex", value: "flex" },
                  { label: "Grid", value: "grid" },
                ]}
              />

              {(current.display || info.final.display) !== "block" && (
                <>
                  <ClassOptionGroup
                    label={<Label prop="flexDirection">Direction</Label>}
                    value={current.flexDirection}
                    onChange={(val: string) => handleUpdate({ flexDirection: val })}
                    disabled={isOverridden("flexDirection")}
                    options={[
                      { label: "Row", value: "row", icon: "material-symbols-light:arrow-right-alt-rounded" },
                      { label: "Column", value: "column", icon: "material-symbols-light:arrow-downward-rounded" },
                    ]}
                  />
                  <ClassOptionGroup
                    label={<Label prop="justifyContent">Justify</Label>}
                    value={current.justifyContent}
                    onChange={(val: string) => handleUpdate({ justifyContent: val })}
                    disabled={isOverridden("justifyContent")}
                    options={[
                      { label: "Start", value: "flex-start", icon: "material-symbols-light:align-justify-flex-start" },
                      { label: "Center", value: "center", icon: "material-symbols-light:align-justify-center" },
                      { label: "End", value: "flex-end", icon: "material-symbols-light:align-justify-flex-end" },
                      { label: "Between", value: "space-between", icon: "material-symbols-light:align-justify-space-between" },
                    ]}
                  />
                  <ClassOptionGroup
                    label={<Label prop="alignItems">Align</Label>}
                    value={current.alignItems}
                    onChange={(val: string) => handleUpdate({ alignItems: val })}
                    disabled={isOverridden("alignItems")}
                    options={[
                      { label: "Start", value: "flex-start", icon: "material-symbols-light:align-vertical-top" },
                      { label: "Center", value: "center", icon: "material-symbols-light:align-vertical-center" },
                      { label: "End", value: "flex-end", icon: "material-symbols-light:align-vertical-bottom" },
                      { label: "Stretch", value: "stretch", icon: "material-symbols-light:align-stretch" },
                    ]}
                  />
                  <ClassGapControl
                    label={<Label prop="rowGap">Gaps</Label>}
                    values={current}
                    onChange={handleUpdate}
                    disabled={isOverridden("rowGap") || isOverridden("columnGap")}
                  />
                </>
              )}

              <ClassSpacingControl
                label={<Label prop="marginTop">Margin</Label>}
                type="margin"
                values={current}
                onChange={handleUpdate}
                disabled={isOverridden("marginTop") || isOverridden("marginRight") || isOverridden("marginBottom") || isOverridden("marginLeft")}
              />
              <ClassSpacingControl
                label={<Label prop="paddingTop">Padding</Label>}
                type="padding"
                values={current}
                onChange={handleUpdate}
                disabled={isOverridden("paddingTop") || isOverridden("paddingRight") || isOverridden("paddingBottom") || isOverridden("paddingLeft")}
              />
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
  render: ({ classes: appliedClassIds, styles: blockStyles, items: Items, puck }) => {
    const { classes: allClasses } = useClassesStore();
    const id = useId();
    
    // 1. Resolve inheritance chains
    const chains = (appliedClassIds || []).map(id => getInheritanceChain(id, allClasses));
    
    // 2. Merge styles: Base -> Chains -> Block Overrides
    const mergedStyles = mergeStyles(chains, blockStyles || {}, baseBlockStyles);

    const sharedClassNames = (appliedClassIds || [])
      .map(id => {
        const cls = allClasses.find(c => c.id === id);
        return cls ? `class-${cls.name.toLowerCase().replace(/\s+/g, "-")}` : "";
      })
      .filter(Boolean)
      .join(" ");

    const blockClass = `puck-container-${id.replace(/:/g, "")}`;
    const css = generateCSS(`.${blockClass}`, mergedStyles);

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <Items
          ref={puck.dragRef}
          as={"section"}
          className={`min-w-0 ${blockClass} ${sharedClassNames}`}
        />
      </>
    );
  },
});
