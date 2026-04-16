import { Icon } from "@iconify/react";
import { type BreakpointKey, PUCK_VIEWPORTS } from "../../config/viewports";
import { useState, useRef, useEffect } from "react";
import { createUsePuck } from "@puckeditor/core";

export type PseudoState = "normal" | "hover" | "focus" | "active" | string;

interface BreakpointPseudoSelectorProps {
  activeBreakpoint: BreakpointKey;
  setActiveBreakpoint: (bp: BreakpointKey) => void;
  activePseudo: PseudoState;
  setActivePseudo: (ps: PseudoState) => void;
  customStates?: Array<{ label: string; selector: string }>;
  onAddCustomState?: (label: string, selector: string) => void;
}

const usePuck = createUsePuck();

export const BreakpointPseudoSelector = ({
  activeBreakpoint,
  setActiveBreakpoint,
  activePseudo,
  setActivePseudo,
  customStates = [],
  onAddCustomState,
}: BreakpointPseudoSelectorProps) => {
  const dispatch = usePuck((s) => s.dispatch);
  const viewports = usePuck((s) => s.appState.ui.viewports);
  const [bpDropdownOpen, setBpDropdownOpen] = useState(false);
  const [pseudoDropdownOpen, setPseudoDropdownOpen] = useState(false);

  // New state popout
  const [addingNew, setAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newSelector, setNewSelector] = useState("");

  const bpRef = useRef<HTMLDivElement>(null);
  const pseudoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bpRef.current && !bpRef.current.contains(e.target as Node)) {
        setBpDropdownOpen(false);
      }
      if (pseudoRef.current && !pseudoRef.current.contains(e.target as Node)) {
        setPseudoDropdownOpen(false);
        setAddingNew(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const breakpoints: { key: BreakpointKey; label: string; icon: string }[] = [
    { key: "desktop", label: "Base", icon: "mdi:monitor" },
    { key: "laptop", label: "Laptop", icon: "mdi:laptop" },
    { key: "tablet", label: "Tablet", icon: "mdi:tablet" },
    { key: "mobile", label: "Mobile", icon: "mdi:cellphone" },
  ];

  const standardPseudoStates: { key: string; label: string; icon: string }[] = [
    { key: "normal", label: "Normal", icon: "lucide:mouse-pointer-2" },
    { key: "hover", label: "Hover", icon: "lucide:square-mouse-pointer" },
    { key: "focus", label: "Focus", icon: "lucide:mouse-pointer-click" },
    { key: "active", label: "Active", icon: "lucide:square-dashed-mouse-pointer" },
  ];

  const allPseudoStates = [
    ...standardPseudoStates,
    ...customStates.map((cs) => ({ key: cs.selector, label: cs.label, icon: "lucide:spline-pointer" })),
  ];

  const handleBreakpointChange = (key: BreakpointKey) => {
    setActiveBreakpoint(key);

    // Sync Puck viewport
    const vp = PUCK_VIEWPORTS.find((v) => v.label?.toLowerCase() === key.toLowerCase());
    if (vp) {
      dispatch({
        type: "setUi",
        ui: {
          viewports: {
            ...viewports,
            current: {
              width: vp.width,
              height: "auto",
            },
          },
        },
      });
    }
  };

  const activeBpObj = breakpoints.find((b) => b.key === activeBreakpoint) || breakpoints[0];
  const activePseudoObj = allPseudoStates.find((p) => p.key === activePseudo) || allPseudoStates[0];

  const handleAddCustom = () => {
    if (newLabel.trim() && newSelector.trim() && onAddCustomState) {
      onAddCustomState(newLabel.trim(), newSelector.trim());
      setAddingNew(false);
      setNewLabel("");
      setNewSelector("");
    }
  };

  return (
    <div className="flex gap-2 relative z-50">
      {/* Breakpoint Dropdown */}
      <div className="flex-1 relative" ref={bpRef}>
        <button
          onClick={() => setBpDropdownOpen(!bpDropdownOpen)}
          className="w-full h-8 flex items-center justify-between bg-zinc-100 px-2 rounded border-none outline-none text-[11px] font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Icon icon={activeBpObj.icon} width={14} />
            {activeBpObj.label}
          </div>
          <Icon icon="mdi:chevron-down" width={14} />
        </button>

        {bpDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-zinc-200 shadow-lg">
            {breakpoints.map((bp) => (
              <div
                key={bp.key}
                className="relative group"
              >
                <button
                  onClick={() => {
                    handleBreakpointChange(bp.key);
                    setBpDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] hover:bg-zinc-100 ${activeBreakpoint === bp.key ? "text-primary font-semibold bg-blue-50/50" : "text-zinc-700"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon icon={bp.icon} width={14} />
                    {bp.label}
                  </div>
                  <Icon icon="mdi:chevron-right" width={14} className="text-zinc-400" />
                </button>

                <div className="absolute top-0 left-full bg-white border border-zinc-200 shadow-lg   hidden group-hover:block transition-all">
                  {allPseudoStates.map((ps) => (
                    <button
                      key={ps.key}
                      onClick={() => {
                        handleBreakpointChange(bp.key);
                        setActivePseudo(ps.key);
                        setBpDropdownOpen(false);
                      }}
                      className={`w-full whitespace-nowrap text-left px-3 py-1.5 text-[11px] hover:bg-zinc-100 ${activeBreakpoint === bp.key && activePseudo === ps.key
                        ? "text-primary font-semibold bg-blue-50/50"
                        : "text-zinc-700"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon icon={ps.icon} width={14} />
                        {ps.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pseudo Dropdown */}
      <div className="flex-1 relative" ref={pseudoRef}>
        <button
          onClick={() => setPseudoDropdownOpen(!pseudoDropdownOpen)}
          className="w-full h-8 flex items-center justify-between bg-zinc-100 px-2 rounded border-none outline-none text-[11px] font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
        >
          <span>{activePseudoObj.label}</span>
          <Icon icon="mdi:chevron-down" width={14} />
        </button>

        {pseudoDropdownOpen && (
          <div className="absolute top-full right-0 mt-1 w-full bg-white border border-zinc-200 rounded shadow-lg">
            {!addingNew ? (
              <>
                {allPseudoStates.map((ps) => (
                  <button
                    key={ps.key}
                    onClick={() => {
                      setActivePseudo(ps.key);
                      setPseudoDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-zinc-100 ${activePseudo === ps.key ? "text-primary font-semibold bg-blue-50/50" : "text-zinc-700"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon icon={ps.icon} width={14} />
                      {ps.label}
                    </div>
                  </button>
                ))}
                <div className="border-t border-zinc-100 my-1"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddingNew(true);
                  }}
                  className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                >
                  <Icon icon="mdi:plus" width={14} />
                  Add new
                </button>
              </>
            ) : (
              <div className="p-2 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-zinc-700">Add Custom State</span>
                  <button onClick={() => setAddingNew(false)} className="text-zinc-400 hover:text-zinc-700">
                    <Icon icon="mdi:close" width={14} />
                  </button>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 mb-0.5 block">Label (e.g. Next Element)</label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full h-7 bg-zinc-50 border border-zinc-200 rounded px-2 text-[11px] outline-none focus:border-primary"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 mb-0.5 block">Selector (e.g. + *)</label>
                  <input
                    type="text"
                    value={newSelector}
                    onChange={(e) => setNewSelector(e.target.value)}
                    className="w-full h-7 bg-zinc-50 border border-zinc-200 rounded px-2 text-[11px] outline-none focus:border-primary font-mono"
                  />
                </div>
                <button
                  onClick={handleAddCustom}
                  disabled={!newLabel.trim() || !newSelector.trim()}
                  className="w-full h-7 mt-1 bg-primary text-white rounded text-[11px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
