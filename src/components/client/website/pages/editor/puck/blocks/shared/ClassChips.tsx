import { useClassesStore } from "@/stores/useClassesStore";
import { Icon } from "@iconify/react";
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useWebsitesStore } from "@/stores/useWebsitesStore";

export const ClassChips = ({ value = [], onChange }: { value: string[], onChange: (val: string[]) => void }) => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const { websites } = useWebsitesStore();
  const websiteId = websites.find((w) => w.subdomain === subdomain)?.id || "";

  const { classes, activeClassId, setActiveClassId, addClass } = useClassesStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const appliedClasses = useMemo(() =>
    value.map(id => classes.find(c => c.id === id)).filter(Boolean),
    [value, classes]
  );

  const availableClasses = useMemo(() =>
    classes.filter(c => !value.includes(c.id) && c.name.toLowerCase().includes(search.toLowerCase())),
    [classes, value, search]
  );

  const handleCreateAndAdd = () => {
    if (!search.trim()) return;

    // Check if class with same name already exists
    const existing = classes.find(c => c.name.toLowerCase() === search.trim().toLowerCase());
    if (existing) {
      if (!value.includes(existing.id)) {
        onChange([...value, existing.id]);
        setActiveClassId(existing.id);
      }
    } else {
      // Create new
      const newId = addClass(websiteId, { name: search.trim() });
      onChange([...value, newId]);
      setActiveClassId(newId);
    }
    setSearch("");
    setOpen(false);
  };

  // Effect to auto-add the class if it was just created (hacky but works with optimistic state)
  // Or better, let's just pass the ID to addClass.

  const handleSelect = (id: string) => {
    onChange([...value, id]);
    setActiveClassId(id);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5 items-center relative">
        <div
          onClick={() => setActiveClassId(null)}
          className={`flex items-center px-2.5 h-7 rounded-full text-[11px] font-bold cursor-pointer transition-all border ${activeClassId === null
            ? 'bg-zinc-800 text-white border-zinc-800 shadow-sm'
            : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
            }`}
        >
          Base
        </div>

        {appliedClasses.map((c: any) => (
          <div
            key={c.id}
            onClick={() => setActiveClassId(activeClassId === c.id ? null : c.id)}
            className={`flex items-center gap-1.5 p-1.5 py-1 leading-none rounded-full text-[10px] font-semibold cursor-pointer transition-all border ${activeClassId === c.id
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
              }`}
          >
            {c.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(value.filter(id => id !== c.id));
                if (activeClassId === c.id) setActiveClassId(null);
              }}
              className={`hover:text-red-500 transition-colors ${activeClassId === c.id ? 'text-white/70' : 'text-zinc-400'}`}
            >
              <Icon icon="mdi:close" width={14} />
            </button>
          </div>
        ))}
        {open && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => { setOpen(false); setSearch(""); }} />
            <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 shadow-2xl rounded-lg min-w-[200px] overflow-hidden z-[70] flex flex-col">
              <div className="p-2 bg-zinc-50 border-b border-zinc-100">
                <div className="relative">
                  <Icon icon="mdi:magnify" className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" width={14} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search or create..."
                    className="w-full pl-7 pr-2 py-1.5 text-xs bg-white border border-zinc-200 rounded outline-none focus:border-primary/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && search.trim()) {
                        handleCreateAndAdd();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="max-h-[200px] overflow-y-auto py-1">
                {availableClasses.length > 0 ? (
                  availableClasses.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelect(c.id)}
                      className="w-full text-left px-3 py-2 text-[11px] hover:bg-primary/5 hover:text-primary text-zinc-700 flex items-center justify-between group"
                    >
                      <span>{c.name}</span>
                      <Icon icon="mdi:chevron-right" className="opacity-0 group-hover:opacity-100" />
                    </button>
                  ))
                ) : search.trim() ? (
                  <button
                    onClick={handleCreateAndAdd}
                    className="w-full text-left px-3 py-2 text-[11px] hover:bg-primary/5 text-primary font-medium flex items-center gap-2"
                  >
                    <Icon icon="mdi:plus-circle-outline" />
                    Create "{search}"
                  </button>
                ) : (
                  <div className="px-3 py-4 text-[11px] text-zinc-400 italic text-center">No classes available</div>
                )}
              </div>
            </div>
          </>
        )}
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              setOpen(!open);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-primary transition-all border border-zinc-200"
            title="Add Class"
          >
            <Icon icon="mdi:plus" width={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
