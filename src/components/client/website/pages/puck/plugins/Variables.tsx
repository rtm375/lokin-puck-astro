import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useVariablesStore } from "@/stores/useVariablesStore";
import { Icon } from "@iconify/react";
import { VARIABLE_TYPES, type Variable, VariableMode, type VariableType } from "@/types";
import { useParams } from "react-router-dom";
import { useWebsitesStore } from "@/stores/useWebsitesStore";
import { useVariableDnD } from "@/hooks/useVariableDnd";

export const VariablesPlugin = () => {

  const { subdomain } = useParams<{ subdomain: string }>();
  const { websites } = useWebsitesStore();
  const websiteId = websites.find((w) => w.subdomain === subdomain)?.id || "";

  const {
    collections,
    variables,
    activeCollection,
    activeMode,
    activeSkin,
    isLoading,
    hasUnsavedChanges,
    isSaving,
    saveChanges,
    setActiveCollection,
    setActiveMode,
    setActiveSkin,
    fetchVariablesData,
    addVariable,
    updateVariable,
    addCollection,
    reorderVariables
  } = useVariablesStore();

  const [newColName, setNewColName] = useState("");
  const [isCreatingCol, setIsCreatingCol] = useState(false);
  const [isEditingCollection, setIsEditingCollection] = useState(false);

  const [editingVariable, setEditingVariable] = useState<Variable | null>(null);
  const [creatingState, setCreatingState] = useState<{ type: string; groupId?: string } | null>(null);

  useEffect(() => {
    if (websiteId) {
      fetchVariablesData(websiteId);
    }
  }, [websiteId]);

  const activeVariables = useMemo(() =>
    variables.filter((v) =>
      v.variables_collection_id === activeCollection &&
      v.mode === activeMode &&
      v.skin === activeSkin
    ),
    [variables, activeCollection, activeMode, activeSkin]
  );

  const rootVariables = useMemo(() =>
    activeVariables
      .filter((v) => !v.group_id)
      .sort((a, b) => {
        if (a.is_group !== b.is_group) return a.is_group ? 1 : -1;
        return a.sort_order - b.sort_order;
      }),
    [activeVariables]
  );

  const handleReorder = useCallback((updatedVars: Variable[]) => {
    reorderVariables(websiteId, updatedVars);
  }, [reorderVariables, websiteId]);

  const { dragState, handleDragStart, handleDragOver, handleDrop, handleDragEnd } = useVariableDnD(
    activeVariables,
    handleReorder
  );

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500">Loading variables...</div>;
  }

  const currentCollection = collections.find((c) => c.id === activeCollection);

  return (
    <div className="relative flex flex-col h-full bg-white border-l border-zinc-200">
      <div className="py-4 border-b border-zinc-200 space-y-2">
        <div className="flex items-center justify-between px-2 h-8">
          <h2 className="text-sm font-semibold">Style Variables</h2>
          {hasUnsavedChanges && (
            <button
              onClick={() => saveChanges(websiteId)}
              disabled={isSaving}
              className="flex items-center gap-1 px-2 h-8 bg-primary hover:bg-primary/90 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? <Icon icon="mdi:loading" className="animate-spin" /> : <Icon icon="mdi:content-save" />}
              Save
            </button>
          )}
        </div>

        {isCreatingCol ? (
          <div className="flex items-center gap-2 px-2">
            <input
              type="text"
              className="w-full flex-1 bg-zinc-100 px-2 h-8 text-sm border-2 border-zinc-300 outline-none cursor-pointer"
              placeholder="Collection name"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newColName.trim()) {
                  addCollection(websiteId, newColName.trim());
                  setIsCreatingCol(false);
                  setNewColName("");
                }
              }}
              autoFocus
            />
            <button onClick={() => setIsCreatingCol(false)} className="w-8 h-8 shrink-0 border-2 border-zinc-300 hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition-colors">
              <Icon icon="mdi:close" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-2">
            <select
              className="flex-1 bg-zinc-100 px-2 h-8 text-sm border-2 border-zinc-300 outline-none cursor-pointer"
              value={activeCollection || ""}
              onChange={(e) => setActiveCollection(e.target.value)}
            >
              {!collections && <option value="" disabled>Select Collection</option>}
              {collections.map((col) => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
            <button
              onClick={() => setIsCreatingCol(true)}
              className="w-8 h-8 border-2 border-zinc-300 hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition-colors"
            >
              <Icon icon="mdi:plus" />
            </button>
          </div>
        )}

        {currentCollection && (
          <div className="space-y-4">
            <div className={`flex items-center justify-between px-2 ${!isEditingCollection ? 'pb-4 border-b border-zinc-200' : ''}`}>
              <span className="text-sm font-medium text-zinc-500">Properties</span>
              <button
                onClick={() => setIsEditingCollection(!isEditingCollection)}
                className={`p-1 hover:bg-zinc-100 text-zinc-500 transition-colors ${isEditingCollection ? 'text-blue-500' : 'text-zinc-400'}`}
                title="Edit Collection Settings"
              >
                {isEditingCollection ?
                  <Icon icon="mdi:close" />
                  : <Icon icon="mdi:cog" />
                }
              </button>
            </div>

            {!isEditingCollection && (
              <div className="flex gap-2 px-2">
                <div className="flex-1">
                  <label className="text-xs text-zinc-400 font-semibold mb-1 block">Mode</label>
                  <select
                    className="w-full bg-zinc-100 px-2 h-8 text-sm border-2 border-zinc-200 outline-none"
                    value={activeMode}
                    onChange={(e) => setActiveMode(e.target.value as VariableMode)}
                  >
                    {currentCollection.modes.map((mode: VariableMode) => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-zinc-400 font-semibold mb-1 block">Skin</label>
                  <select
                    className="w-full bg-zinc-100 px-2 h-8 text-sm border-2 border-zinc-200 outline-none"
                    value={activeSkin}
                    onChange={(e) => setActiveSkin(e.target.value)}
                  >
                    {currentCollection.skins.map((skin: string) => (
                      <option key={skin} value={skin}>{skin}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {!activeCollection ? (
          <div className="text-sm text-zinc-500 text-center py-8">Select or create a collection.</div>
        ) : isEditingCollection ? (
          <CollectionSettings websiteId={websiteId} collection={currentCollection} onBack={() => setIsEditingCollection(false)} />
        ) : (
          <div className="space-y-2">
            <div className="flex flex-col relative">
              {rootVariables.map((variable, index) => (
                <VariableItem
                  key={variable.id}
                  variable={variable}
                  websiteId={websiteId}
                  allActiveVariables={activeVariables}
                  onEdit={setEditingVariable}
                  dragState={dragState}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  isFirstGroup={variable.is_group && index === rootVariables.findIndex(v => v.is_group)}
                />
              ))}

              {rootVariables.length === 0 && (
                <div className="text-sm text-zinc-400 text-center mx-2 py-4 border-2 border-dashed border-zinc-300">
                  No variables in this collection.
                </div>
              )}
            </div>

            <VariableCreator
              collection={currentCollection}
              onAdd={(data) => addVariable(websiteId, { ...data })}
              onTriggerCreate={(type) => setCreatingState({ type })}
              onAddGroup={() => addVariable(websiteId, { name: "New Group", value: "", is_group: true })}
            />
          </div>
        )}
      </div>

      {editingVariable && (
        <VariablePopover
          variable={editingVariable}
          onClose={() => setEditingVariable(null)}
          onConfirm={(name, value) => {
            updateVariable(websiteId, editingVariable.id, { name, value });
            setEditingVariable(null);
          }}
        />
      )}

      {creatingState && (
        <VariablePopover
          type={creatingState.type}
          onClose={() => setCreatingState(null)}
          onConfirm={(name, value) => {
            addVariable(websiteId, {
              name,
              value,
              is_group: false,
              group_id: creatingState.groupId
            });
            setCreatingState(null);
          }}
        />
      )}
    </div>
  );
};

const VariableCreator = ({
  collection,
  onAdd,
  onTriggerCreate,
  onAddGroup,
  groupId
}: {
  collection: any,
  onAdd: (data: any) => void,
  onTriggerCreate: (type: string) => void,
  onAddGroup?: () => void,
  groupId?: string
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const availableTypes = VARIABLE_TYPES.filter(t => collection?.variable_types?.includes(t.id));

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex gap-2 px-2">
        <div className="flex-1">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-sm py-1.5 border-2 border-zinc-200 flex items-center justify-center gap-1 hover:s0 text-zinc-600"
          >
            <Icon icon="mdi:plus" /> Variable
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white border-2 border-zinc-200 shadow-lg z-50 overflow-hidden whitespace-nowrap">
              {availableTypes.length > 0 ? (
                availableTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      onTriggerCreate(type.id);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 flex items-center gap-2"
                  >
                    <Icon icon={type.icon} className="text-zinc-400" />
                    {type.label}
                  </button>
                ))
              ) : (
                <div className="p-2 text-xs text-zinc-400 text-center">No types enabled in settings</div>
              )}
              <div className="border-t border-zinc-100">
                <button
                  onClick={() => {
                    onAdd({ name: "New Variable", value: "", is_group: false, group_id: groupId });
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 text-zinc-500 italic"
                >
                  Simple Name/Value
                </button>
              </div>
            </div>
          )}
        </div>
        {!groupId && onAddGroup && (
          <button
            className="flex-1 text-sm py-1.5 border-2 border-zinc-200 flex items-center justify-center gap-1 hover:bg-zinc-100 text-zinc-600"
            onClick={onAddGroup}
          >
            <Icon icon="mdi:folder-plus-outline" /> Group
          </button>
        )}
      </div>
    </div>
  );
};

const VariablePopover = ({
  type: initialType,
  variable,
  onClose,
  onConfirm
}: {
  type?: string,
  variable?: Variable,
  onClose: () => void,
  onConfirm: (name: string, value: string) => void
}) => {
  const [name, setName] = useState(variable?.name || "");
  const [value, setValue] = useState(variable?.value || "");
  const [type, setType] = useState(initialType || "simple");

  useEffect(() => {
    if (variable && !initialType && type === "simple") {
      const val = variable.value;
      if (val.includes("gradient") || val.startsWith("#") || val.startsWith("rgb") || val.startsWith("hsl")) {
        setType("color");
      } else if (val.match(/^-?\d+(\.\d+)?(px|em|rem|%|vw|vh)$/)) {
        setType("length");
      } else if (val.split(" ").length >= 4) {
        if (val.split(" ").length === 4) setType("text-shadow");
        else setType("box-shadow");
      }
    }
  }, [variable, initialType]);

  const title = variable ? "Edit Variable" : (VARIABLE_TYPES.find(t => t.id === type)?.label || "Add Variable");

  const handleConfirm = () => {
    if (!name) return;
    onConfirm(name, value);
  };

  return (
    <div
      className="absolute inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-2"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="bg-white border-2 border-zinc-200 shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2 border-b border-zinc-100 flex items-center justify-between">
          <span className="text-sm font-semibold">{title}</span>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 text-zinc-400">
            <Icon icon="mdi:close" />
          </button>
        </div>

        <div className="p-2 py-4 space-y-4">
          <div>
            <label className="text-xs text-zinc-400 font-semibold mb-1 block">Variable Name</label>
            <input
              autoFocus
              className="w-full bg-zinc-100 px-2 h-8 text-sm border-2 border-zinc-200 outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Primary Color"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            {variable && (
              <div className="mb-2">
                <label className="text-xs text-zinc-400 font-semibold mb-1 block">Variable Type</label>
                <select
                  className="w-full bg-zinc-100 px-2 h-8 text-sm border-2 border-zinc-200 outline-none"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="simple">Simple Text</option>
                  {VARIABLE_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
            )}

            {type === "color" && <ColorCreator initialValue={value} onChange={setValue} />}
            {type === "length" && <LengthCreator initialValue={value} onChange={setValue} />}
            {type === "box-shadow" && <BoxShadowCreator initialValue={value} onChange={setValue} />}
            {type === "text-shadow" && <TextShadowCreator initialValue={value} onChange={setValue} />}
            {type === "simple" && (
              <div>
                <label className="text-xs text-zinc-400 uppercase font-bold mb-1 block">Value</label>
                <input
                  className="w-full bg-zinc-100 px-2 h-8 text-sm border-2 border-zinc-200 outline-none"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="px-2 pb-4 flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={!name}
            className="flex-1 px-2 h-8 cursor-pointer text-sm font-medium bg-primary hover:bg-primary/90 text-white shadow-sm disabled:opacity-50"
          >
            {variable ? "Update" : "Add"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-2 h-8 cursor-pointer text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const ColorCreator = ({ initialValue, onChange }: { initialValue?: string, onChange: (val: string) => void }) => {
  const [activeTab, setActiveTab] = useState<"solid" | "gradient">(initialValue?.includes("gradient") ? "gradient" : "solid");
  const [color, setColor] = useState(() => (initialValue && !initialValue.includes("gradient") ? initialValue : "#000000"));
  const [gradient, setGradient] = useState(() => (initialValue?.includes("gradient") ? initialValue : "linear-gradient(90deg, #000000 0%, #ffffff 100%)"));

  useEffect(() => {
    onChange(activeTab === "solid" ? color : gradient);
  }, [activeTab, color, gradient]);

  return (
    <div className="space-y-2">
      <div className="flex bg-zinc-200 border-2 border-zinc-200">
        <button
          onClick={() => setActiveTab("solid")}
          className={`flex-1 px-2 h-7 text-sm font-medium transition-all ${activeTab === 'solid' ? 'bg-white' : 'text-zinc-500'}`}
        >
          Solid
        </button>
        <button
          onClick={() => setActiveTab("gradient")}
          className={`flex-1 px-2 h-7 text-sm font-medium transition-all ${activeTab === 'gradient' ? 'bg-white' : 'text-zinc-500'}`}
        >
          Gradient
        </button>
      </div>

      {activeTab === "solid" ? (
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 shrink-0 border-2 border-zinc-200 overflow-hidden cursor-pointer">
            <input
              type="color"
              className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer hover:opacity-80"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          <input
            className="w-full bg-zinc-100 px-2 h-8 text-sm border-2 border-zinc-200 uppercase"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            className="w-full h-20 bg-zinc-100 px-3 py-2 text-sm border-2 border-zinc-200 outline-none resize-none"
            placeholder="linear-gradient(...)"
            value={gradient}
            onChange={(e) => setGradient(e.target.value)}
          />
          <div className="h-4 border-2 border-zinc-200" style={{ background: gradient }} />
        </div>
      )}
    </div>
  );
};

const LengthCreator = ({ initialValue, onChange }: { initialValue?: string, onChange: (val: string) => void }) => {
  const units = ["px", "em", "rem", "%", "vw", "vh"];
  const [value, setValue] = useState(() => {
    if (!initialValue) return "16";
    const match = initialValue.match(/^(-?\d+(\.\d+)?)/);
    return match ? match[1] : "16";
  });
  const [unit, setUnit] = useState(() => {
    if (!initialValue) return "px";
    const match = initialValue.match(/(px|em|rem|%|vw|vh)$/);
    return match ? match[1] : "px";
  });

  useEffect(() => {
    onChange(`${value}${unit}`);
  }, [value, unit]);

  return (
    <div className="space-y-2">
      <input
        type="number"
        className="w-full bg-zinc-100 px-2 h-8 text-sm border-2 border-zinc-200 outline-none"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="grid grid-cols-3 gap-1 flex-1">
        {units.map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`text-xs py-1 border-2 transition-colors ${unit === u ? 'bg-zinc-900 text-white border-transparent' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-500'}`}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  );
};

const BoxShadowCreator = ({ initialValue, onChange }: { initialValue?: string, onChange: (val: string) => void }) => {
  const parseShadow = (val?: string) => {
    if (!val) return { x: "0", y: "4", blur: "10", spread: "0", color: "rgba(0,0,0,0.1)" };
    const parts = val.split(" ");
    if (parts.length < 4) return { x: "0", y: "4", blur: "10", spread: "0", color: "rgba(0,0,0,0.1)" };
    return {
      x: parts[0]?.replace("px", "") || "0",
      y: parts[1]?.replace("px", "") || "4",
      blur: parts[2]?.replace("px", "") || "10",
      spread: parts[3]?.replace("px", "") || "0",
      color: parts.slice(4).join(" ") || "rgba(0,0,0,0.1)"
    };
  };

  const initial = parseShadow(initialValue);
  const [x, setX] = useState(initial.x);
  const [y, setY] = useState(initial.y);
  const [blur, setBlur] = useState(initial.blur);
  const [spread, setSpread] = useState(initial.spread);
  const [color, setColor] = useState(initial.color);

  useEffect(() => {
    onChange(`${x}px ${y}px ${blur}px ${spread}px ${color}`);
  }, [x, y, blur, spread, color]);

  const Input = ({ label, value, onChange }: any) => (
    <div className="flex-1">
      <label className="text-[9px] text-zinc-400 uppercase mb-0.5 block">{label}</label>
      <input
        type="text"
        className="w-full bg-zinc-100 px-2 h-8 text-sm border-2 border-zinc-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input label="X" value={x} onChange={setX} />
        <Input label="Y" value={y} onChange={setY} />
        <Input label="Blur" value={blur} onChange={setBlur} />
        <Input label="Spread" value={spread} onChange={setSpread} />
      </div>
      <div>
        <label className="text-[9px] text-zinc-400 uppercase mb-0.5 block">Shadow Color</label>
        <input
          className="w-full bg-zinc-100 px-2 h-8 text-sm border-2 border-zinc-200"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
    </div>
  );
};

const TextShadowCreator = ({ initialValue, onChange }: { initialValue?: string, onChange: (val: string) => void }) => {
  const parseShadow = (val?: string) => {
    if (!val) return { x: "0", y: "2", blur: "4", color: "rgba(0,0,0,0.2)" };
    const parts = val.split(" ");
    if (parts.length < 3) return { x: "0", y: "2", blur: "4", color: "rgba(0,0,0,0.2)" };
    return {
      x: parts[0]?.replace("px", "") || "0",
      y: parts[1]?.replace("px", "") || "2",
      blur: parts[2]?.replace("px", "") || "4",
      color: parts.slice(3).join(" ") || "rgba(0,0,0,0.2)"
    };
  };

  const initial = parseShadow(initialValue);
  const [x, setX] = useState(initial.x);
  const [y, setY] = useState(initial.y);
  const [blur, setBlur] = useState(initial.blur);
  const [color, setColor] = useState(initial.color);

  useEffect(() => {
    onChange(`${x}px ${y}px ${blur}px ${color}`);
  }, [x, y, blur, color]);

  const Input = ({ label, value, onChange }: any) => (
    <div className="flex-1">
      <label className="text-[9px] text-zinc-400 uppercase mb-0.5 block">{label}</label>
      <input
        type="text"
        className="w-full bg-zinc-100 px-2 h-8 text-sm border-2 border-zinc-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input label="X" value={x} onChange={setX} />
        <Input label="Y" value={y} onChange={setY} />
        <Input label="Blur" value={blur} onChange={setBlur} />
      </div>
      <div>
        <label className="text-[9px] text-zinc-400 uppercase mb-0.5 block">Shadow Color</label>
        <input
          className="w-full bg-zinc-100 px-2 h-8 text-sm border-2 border-zinc-200"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
    </div>
  );
};

const VariableTypeMultiSelect = ({ value, onChange }: { value: VariableType[], onChange: (val: VariableType[]) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedLabels = VARIABLE_TYPES
    .filter(opt => value.includes(opt.id))
    .map(opt => opt.label)
    .join(", ");

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-100 px-3 h-8 text-sm border-2 border-zinc-200 hover:border-zinc-300 transition-all group"
      >
        <span className="truncate text-zinc-600 group-hover:text-zinc-900">
          {selectedLabels || "Select types..."}
        </span>
        <Icon icon="mdi:chevron-down" className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-zinc-200 shadow-2xl z-[200] py-1">
          {VARIABLE_TYPES.map((type) => (
            <label
              key={type.id}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-100 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded-sm border-zinc-300 text-zinc-900 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                checked={value.includes(type.id)}
                onChange={(e) => {
                  const newValue = e.target.checked
                    ? [...value, type.id]
                    : value.filter(v => v !== type.id);
                  onChange(newValue);
                }}
              />
              <span className="text-sm text-zinc-600 select-none">{type.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const CollectionSettings = ({ websiteId, collection, onBack }: { websiteId: string, collection: any, onBack: () => void }) => {
  const { updateCollection, deleteCollection, activeSkin, setActiveSkin, variables, updateVariable } = useVariablesStore();
  const [newSkin, setNewSkin] = useState("");
  const [editingSkin, setEditingSkin] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleRenameSkin = (oldSkin: string) => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === oldSkin) {
      setEditingSkin(null);
      return;
    }

    if (collection.skins.includes(trimmed)) {
      setEditingSkin(null);
      return;
    }

    const newSkins = collection.skins.map((s: string) => s === oldSkin ? trimmed : s);
    updateCollection(websiteId, collection.id, { skins: newSkins });

    // Cascade rename to all variables in this collection
    variables.forEach(v => {
      if (v.variables_collection_id === collection.id && v.skin === oldSkin) {
        updateVariable(websiteId, v.id, { skin: trimmed });
      }
    });

    if (activeSkin === oldSkin) {
      setActiveSkin(trimmed);
    }

    setEditingSkin(null);
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-4 px-2">
        <div>
          <label className="text-xs text-zinc-400 font-semibold mb-1 block">Collection Name</label>
          <input
            className="w-full bg-zinc-100 px-2 h-8 text-sm border-2 border-zinc-200 outline-none"
            value={collection.name}
            onChange={(e) => updateCollection(websiteId, collection.id, { name: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 font-semibold mb-1 block">Skins</label>
          <div className="space-y-2">
            {collection.skins.map((skin: string) => (
              <div key={skin} className="flex items-center justify-between bg-zinc-100 px-2 h-8 border-2 border-zinc-200 group">
                {editingSkin === skin ? (
                  <input
                    autoFocus
                    className="flex-1 text-sm px-1 -ml-1 border-none outline-none ring-0 h-full"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleRenameSkin(skin)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSkin(skin);
                      if (e.key === "Escape") setEditingSkin(null);
                    }}
                  />
                ) : (
                  <span
                    className={`text-sm flex-1 ${skin !== "Default" ? "cursor-text hover:text-blue-500" : "cursor-not-allowed"}`}
                    onClick={() => {
                      if (skin !== "Default") {
                        setEditingSkin(skin);
                        setEditValue(skin);
                      }
                    }}
                  >
                    {skin}
                  </span>
                )}
                {skin !== "Default" && !editingSkin && (
                  <button
                    onClick={() => updateCollection(websiteId, collection.id, { skins: collection.skins.filter((s: string) => s !== skin) })}
                    className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon icon="mdi:trash-can-outline" />
                  </button>
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <input
                className="w-full bg-zinc-100 px-2 h-8 text-sm border-2 border-zinc-200 outline-none"
                placeholder="New skin name"
                value={newSkin}
                onChange={(e) => setNewSkin(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSkin.trim()) {
                    updateCollection(websiteId, collection.id, { skins: [...collection.skins, newSkin.trim()] });
                    setNewSkin("");
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newSkin.trim()) {
                    updateCollection(websiteId, collection.id, { skins: [...collection.skins, newSkin.trim()] });
                    setNewSkin("");
                  }
                }}
                className="p-1 px-2 text-sm bg-primary hover:bg-primary/90 text-white cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-400 font-semibold mb-1 block">Variable Types</label>
          <div className="relative">
            <VariableTypeMultiSelect
              value={collection.variable_types}
              onChange={(types) => updateCollection(websiteId, collection.id, { variable_types: types })}
            />
          </div>
        </div>
      </div>
      <div className="px-2">
        <button
          onClick={() => {
            if (confirm("Are you sure you want to delete this collection and all its variables?")) {
              deleteCollection(websiteId, collection.id);
              onBack();
            }
          }}
          className="w-full py-2 h-8 text-sm text-red-500 border-2 border-red-200 hover:bg-red-50 flex items-center justify-center gap-1 cursor-pointer"
        >
          <Icon icon="mdi:delete" /> Delete Collection
        </button>
      </div>
    </div>
  );
};

const VariableRow = memo(({
  variable,
  websiteId,
  onEdit,
  isTarget,
  targetPosition,
  dragState,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}: {
  variable: Variable;
  websiteId: string;
  onEdit: (v: Variable) => void;
  isTarget: boolean;
  targetPosition: string | null;
  dragState: any;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) => {
  const { deleteVariable } = useVariablesStore();

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart(variable.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => onDragOver(e, variable.id)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      className={`relative flex items-center gap-2 group bg-white p-1 transition-all cursor-pointer touch-none hover:bg-zinc-100
        ${isTarget ? "z-10" : "z-1"} 
        ${isTarget && targetPosition === "top" && !dragState.draggedItemIsGroup ? "before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-blue-500 before:content-['']" : ""} 
        ${isTarget && targetPosition === "bottom" && !dragState.draggedItemIsGroup ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-blue-500 after:content-['']" : ""}`}
      onClick={() => onEdit(variable)}
    >
      <div className="flex-1 flex items-center min-w-0 p-1">
        <div className="flex-1 text-xs font-medium text-zinc-600 truncate">
          {variable.name}
        </div>
        <div className="flex-1 text-xs text-zinc-400 truncate flex items-center gap-2">
          {variable.value.startsWith("#") || variable.value.startsWith("rgb") ? (
            <div className="w-4 h-4 rounded-full border-2 border-zinc-200 shrink-0" style={{ background: variable.value }} />
          ) : null}
          <span className="truncate">{variable.value || "No value"}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteVariable(websiteId, variable.id);
          }}
          className="p-1 hover:text-red-500 text-zinc-400 transition-colors"
        >
          <Icon icon="mdi:trash-can-outline" />
        </button>
      </div>
    </div>
  );
});

const VariableItem = memo(({
  variable,
  websiteId,
  allActiveVariables,
  onEdit,
  dragState,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isFirstGroup
}: {
  variable: Variable;
  websiteId: string;
  allActiveVariables: Variable[];
  onEdit: (v: Variable) => void;
  dragState: any;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  isFirstGroup?: boolean;
}) => {
  const { updateVariable, deleteVariable } = useVariablesStore();

  const childrenVars = useMemo(() =>
    allActiveVariables
      .filter(v => v.group_id === variable.id)
      .sort((a, b) => {
        if (a.is_group !== b.is_group) return a.is_group ? 1 : -1;
        return a.sort_order - b.sort_order;
      }),
    [allActiveVariables, variable.id]
  );

  const isTarget = dragState.targetId === variable.id;
  const targetPosition = isTarget ? dragState.position : null;

  if (variable.is_group) {
    return (
      <div
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          onDragStart(variable.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragOver={(e) => onDragOver(e, variable.id)}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDrop();
        }}
        onDragEnd={onDragEnd}
        className={`overflow-hidden bg-zinc-100/50 relative
           ${isFirstGroup ? "mt-4" : ""}
  ${isTarget && targetPosition === "top" && dragState.draggedItemIsGroup
            ? "before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-blue-500 before:content-['']"
            : ""}
  ${isTarget && targetPosition === "bottom" && dragState.draggedItemIsGroup
            ? "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-blue-500 after:content-['']"
            : ""}
`}
      >
        <div
          className={`flex items-center justify-between gap-2 p-2 bg-zinc-100 ${isTarget && targetPosition === "inside" ? "bg-blue-50" : ""}`}
        >
          <div className="flex items-center gap-2 flex-1">
            <Icon icon="mdi:folder-outline" className="text-zinc-400" />
            <input
              value={variable.name}
              onChange={(e) => updateVariable(websiteId, variable.id, { name: e.target.value })}
              className="max-w-30 text-sm bg-transparent outline-none font-medium text-zinc-700 flex-1"
              placeholder="GroupName"
            />
          </div>
          <div className="flex items-center">
            <button
              onClick={() => deleteVariable(websiteId, variable.id)}
              className="hover:bg-zinc-200 text-zinc-400 hover:text-red-500 transition-colors"
              title="Delete Group"
            >
              <Icon icon="mdi:trash-can-outline" />
            </button>
          </div>
        </div>
        <div
          className={`relative py-3 bg-white/50 transition-all
              ${isTarget && targetPosition && !childrenVars.length
              ? "before:absolute before:inset-0 before:bg-blue-500/10 before:content-['']"
              : ""
            }`}
        >
          {childrenVars.map((child) => (
            <VariableRow
              key={child.id}
              variable={child}
              websiteId={websiteId}
              onEdit={onEdit}
              isTarget={dragState.targetId === child.id}
              targetPosition={dragState.targetId === child.id ? dragState.position : null}
              dragState={dragState}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
            />
          ))}
          {childrenVars.length === 0 && (
            <div className="text-xs text-zinc-400 mx-2 py-2 border-2 border-dashed border-zinc-200 bg-zinc-100 text-center pointer-events-none">
              Drop variables here
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <VariableRow
      variable={variable}
      websiteId={websiteId}
      onEdit={onEdit}
      isTarget={isTarget}
      targetPosition={targetPosition}
      dragState={dragState}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    />
  );
});

export const variablesPlugin = {
  name: "variables",
  label: "Variables",
  icon: <Icon icon="mdi:palette-swatch" width={24} />,
  render: () => <VariablesPlugin />,
  mobileOnly: false,
};

export default variablesPlugin;
