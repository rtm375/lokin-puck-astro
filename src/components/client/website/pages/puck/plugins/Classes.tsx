import { useState, useEffect, useMemo, useCallback } from "react";
import { useClassesStore } from "@/stores/useClassesStore";
import { Icon } from "@iconify/react";
import { type Class } from "@/types";
import { useParams } from "react-router-dom";
import { useWebsitesStore } from "@/stores/useWebsitesStore";

export const ClassesPlugin = () => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const { websites } = useWebsitesStore();
  const websiteId = websites.find((w) => w.subdomain === subdomain)?.id || "";

  const {
    classes,
    isLoading,
    hasUnsavedChanges,
    isSaving,
    saveChanges,
    fetchClassesData,
    addClass,
    updateClass,
    deleteClass,
    reorderClasses
  } = useClassesStore();

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    if (websiteId) {
      fetchClassesData(websiteId);
    }
  }, [websiteId]);

  const rootClasses = useMemo(() =>
    classes
      .filter((c) => !c.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order),
    [classes]
  );

  const filteredClasses = useMemo(() => {
    if (!search) return rootClasses;
    return rootClasses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [rootClasses, search]);

  const handleAddClass = () => {
    addClass(websiteId, { name: "New Class" });
  };

  const handleRename = (c: Class) => {
    setEditingId(c.id);
    setEditingName(c.name);
  };

  const saveRename = () => {
    if (editingId && editingName) {
      updateClass(websiteId, editingId, { name: editingName });
      setEditingId(null);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500">Loading classes...</div>;
  }

  return (
    <div className="relative flex flex-col h-full bg-white border-l border-zinc-200">
      <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-800">Classes</h2>
        {hasUnsavedChanges && (
          <button
            onClick={() => saveChanges(websiteId)}
            disabled={isSaving}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
          >
            {isSaving ? <Icon icon="mdi:loading" className="animate-spin" /> : <Icon icon="mdi:content-save" />}
            Save
          </button>
        )}
      </div>

      <div className="p-2 border-b border-zinc-100 flex items-center gap-2">
        <div className="relative flex-1">
          <Icon icon="mdi:magnify" className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search classes..."
            className="w-full pl-8 pr-2 py-1.5 text-xs bg-zinc-100 border-none outline-none rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={handleAddClass}
          className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded transition-colors"
          title="Add Class"
        >
          <Icon icon="mdi:plus" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {filteredClasses.length === 0 ? (
          <div className="text-center py-10 text-zinc-400 text-xs italic">
            No classes found
          </div>
        ) : (
          <div className="space-y-0.5 px-2">
            {filteredClasses.map((c) => (
              <ClassItem
                key={c.id}
                item={c}
                websiteId={websiteId}
                allClasses={classes}
                editingId={editingId}
                editingName={editingName}
                setEditingName={setEditingName}
                saveRename={saveRename}
                handleRename={handleRename}
                updateClass={updateClass}
                deleteClass={deleteClass}
                addClass={addClass}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ClassItem = ({
  item,
  websiteId,
  allClasses,
  editingId,
  editingName,
  setEditingName,
  saveRename,
  handleRename,
  updateClass,
  deleteClass,
  addClass
}: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const children = useMemo(() =>
    allClasses
      .filter((c: any) => c.parent_id === item.id)
      .sort((a: any, b: any) => a.sort_order - b.sort_order),
    [allClasses, item.id]
  );

  const isEditing = editingId === item.id;

  return (
    <div className="flex flex-col">
      <div
        className="group flex items-center gap-2 py-1.5 px-2 hover:bg-zinc-50 rounded cursor-pointer text-zinc-700"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className={`p-0.5 text-zinc-400 hover:text-zinc-600 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'} ${children.length === 0 ? 'invisible' : ''}`}
        >
          <Icon icon="mdi:chevron-down" />
        </button>

        <Icon icon="mdi:tag-outline" className="text-zinc-400 shrink-0" width={14} />

        {isEditing ? (
          <input
            autoFocus
            className="flex-1 min-w-0 bg-white border border-primary/30 rounded px-1 py-0.5 text-xs outline-none"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onBlur={saveRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveRename();
              if (e.key === "Escape") handleRename({ id: null });
            }}
          />
        ) : (
          <span className="flex-1 text-xs font-medium truncate select-none">
            {item.name}
          </span>
        )}

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addClass(websiteId, { parent_id: item.id, name: "New Sub-class" });
              setIsExpanded(true);
            }}
            className="p-1 text-zinc-400 hover:text-primary transition-colors"
            title="Add sub-class"
          >
            <Icon icon="mdi:plus" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRename(item);
            }}
            className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors"
            title="Rename"
          >
            <Icon icon="mdi:pencil-outline" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this class and all sub-classes?")) {
                deleteClass(websiteId, item.id);
              }
            }}
            className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Icon icon="mdi:trash-can-outline" />
          </button>
        </div>
      </div>

      {isExpanded && children.length > 0 && (
        <div className="ml-4 border-l border-zinc-100 pl-1 space-y-0.5">
          {children.map((child: any) => (
            <ClassItem
              key={child.id}
              item={child}
              websiteId={websiteId}
              allClasses={allClasses}
              editingId={editingId}
              editingName={editingName}
              setEditingName={setEditingName}
              saveRename={saveRename}
              handleRename={handleRename}
              updateClass={updateClass}
              deleteClass={deleteClass}
              addClass={addClass}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const classesPlugin = {
  name: "classes",
  label: "Classes",
  icon: <Icon icon="mdi:layers-outline" width={24} />,
  render: () => <ClassesPlugin />,
  mobileOnly: false,
};

export default classesPlugin;
