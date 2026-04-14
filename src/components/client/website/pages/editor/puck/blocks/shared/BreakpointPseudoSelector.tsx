import { Icon } from "@iconify/react";
import { type BreakpointKey } from "../../config/viewports";

export type PseudoState = "normal" | "hover" | "focus" | "active";

export const BreakpointPseudoSelector = ({
  activeBreakpoint,
  setActiveBreakpoint,
  activePseudo,
  setActivePseudo
}: {
  activeBreakpoint: BreakpointKey;
  setActiveBreakpoint: (bp: BreakpointKey) => void;
  activePseudo: PseudoState;
  setActivePseudo: (ps: PseudoState) => void;
}) => {
  const breakpoints: { key: BreakpointKey; label: string; icon: string }[] = [
    { key: "desktop", label: "Desktop", icon: "mdi:monitor" },
    { key: "laptop", label: "Laptop", icon: "mdi:laptop" },
    { key: "tablet", label: "Tablet", icon: "mdi:tablet" },
    { key: "mobile", label: "Mobile", icon: "mdi:cellphone" }
  ];

  const pseudoStates: { key: PseudoState; label: string }[] = [
    { key: "normal", label: "Normal" },
    { key: "hover", label: "Hover" },
    { key: "focus", label: "Focus" },
    { key: "active", label: "Active" }
  ];

  return (
    <div className="flex gap-2 mb-2">
      <div className="flex-1 flex bg-zinc-100 rounded p-0.5 *:flex-1 *:h-7 *:flex *:items-center *:justify-center *:rounded *:transition-colors">
        {breakpoints.map(bp => (
          <button
            key={bp.key}
            onClick={() => setActiveBreakpoint(bp.key)}
            className={`${activeBreakpoint === bp.key ? 'bg-white text-primary shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            title={bp.label}
          >
            <Icon icon={bp.icon} width={14} />
          </button>
        ))}
      </div>
      <div className="flex-1">
        <select
          value={activePseudo}
          onChange={(e) => setActivePseudo(e.target.value as PseudoState)}
          className="w-full h-8 bg-zinc-100 px-2 rounded border-none outline-none text-[11px] font-medium text-zinc-700 cursor-pointer"
        >
          {pseudoStates.map(ps => (
            <option key={ps.key} value={ps.key}>{ps.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
