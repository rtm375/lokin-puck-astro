import { createUsePuck } from "@puckeditor/core";

const usePuck = createUsePuck();
import { layerClickRef } from "@components/client/website/pages/editor/puck/plugins/PluginAutoSwitcher";
import {
  setLayerHover,
  useCanvasHover,
  startCanvasHoverTracking,
} from "@components/client/website/pages/editor/puck/plugins/layerHoverBridge";
import { Icon } from "@iconify/react";
import { useState, useEffect, type DragEvent } from "react";

let clipboard: any = null;

/** Generate a unique component ID */
const genId = (type: string) =>
  `${type}-${Math.random().toString(36).slice(2, 11)}`;

/**
 * Recursively regenerate all `props.id` values in an item tree.
 * Handles nested slot arrays in props and associated zones in data.
 */
const regenerateDeepIds = (item: any, zonesMap?: Record<string, any[]>): any => {
  const cloned = JSON.parse(JSON.stringify(item));
  const oldId = cloned.props?.id;
  const newId = genId(cloned.type);
  cloned.props.id = newId;

  // Recursively regenerate IDs in any array props that contain component items
  if (cloned.props) {
    for (const key of Object.keys(cloned.props)) {
      if (Array.isArray(cloned.props[key])) {
        cloned.props[key] = cloned.props[key].map((child: any) => {
          if (child?.props?.id) {
            return regenerateDeepIds(child, zonesMap);
          }
          return child;
        });
      }
    }
  }

  // If a zones map is provided, migrate zones from old ID to new ID
  if (zonesMap && oldId) {
    const zonePrefix = `${oldId}:`;
    for (const zoneKey of Object.keys(zonesMap)) {
      if (zoneKey.startsWith(zonePrefix)) {
        const slotName = zoneKey.slice(zonePrefix.length);
        const newZoneKey = `${newId}:${slotName}`;
        // Recursively regenerate IDs in zone children
        zonesMap[newZoneKey] = (zonesMap[zoneKey] || []).map((child: any) =>
          child?.props?.id ? regenerateDeepIds(child, zonesMap) : child
        );
        delete zonesMap[zoneKey];
      }
    }
  }

  return cloned;
};

const findListAndIndex = (data: any, id: string) => {
  let result: any = null;
  const search = (list: any[]) => {
    if (!Array.isArray(list)) return false;
    const idx = list.findIndex((i: any) => i.props?.id === id);
    if (idx > -1) {
      result = { list, index: idx };
      return true;
    }
    for (const i of list) {
      for (const key in i.props || {}) {
        if (Array.isArray(i.props[key]) && search(i.props[key])) return true;
      }
    }
    return false;
  };

  if (search(data.content)) return result;
  for (const z in data.zones || {}) {
    if (search(data.zones[z])) return result;
  }
  return result;
};

/**
 * Resolve the Puck zone string for an item given its parentId, slotKey, and zoneKey.
 */
const resolveZone = (parentId: string | null, slotKey: string | null, zoneKey: string) => {
  if (parentId && slotKey) return `${parentId}:${slotKey}`;
  return "root:default-zone";
};

type ContextMenuInfo = {
  x: number;
  y: number;
  item: any;
  index: number;
  zone: string;
};

const LayerContextMenu = ({ x, y, item, index, zone, onClose, appState, dispatch, config, setEditingId }: any) => {
  const handleAction = (action: string) => {
    if (action === "duplicate") {
      dispatch({
        type: "duplicate",
        sourceIndex: index,
        sourceZone: zone,
      });
      return onClose();
    }

    if (action === "delete") {
      dispatch({
        type: "remove",
        index,
        zone,
      });
      return onClose();
    }

    if (action === "rename") {
      setEditingId(item.props.id);
      return onClose();
    }

    if (action === "copy") {
      const json = JSON.stringify(item);
      navigator.clipboard.writeText(json);
      clipboard = JSON.parse(json);
      return onClose();
    }

    if (action === "pasteAfter" || action === "pasteBefore") {
      if (!clipboard) return onClose();

      const zonesClone = JSON.parse(JSON.stringify(appState.data.zones || {}));
      const newItem = regenerateDeepIds(clipboard, zonesClone);

      const destinationIndex = action === "pasteAfter" ? index + 1 : index;

      // Use insert + setData: insert creates the node, then setData patches in its full props and zones
      dispatch({
        type: "insert",
        componentType: newItem.type,
        destinationIndex,
        destinationZone: zone,
        id: newItem.props.id,
      });

      // Patch the inserted node's props and merge any zone children
      dispatch({
        type: "setData",
        data: (prev: any) => {
          const newData = JSON.parse(JSON.stringify(prev));
          const target = findListAndIndex(newData, newItem.props.id);
          if (target) {
            target.list[target.index] = newItem;
          }
          // Merge cloned zones (for nested slot children)
          const currentZoneKeys = Object.keys(newData.zones || {});
          const newZoneKeys = Object.keys(zonesClone).filter(k => !currentZoneKeys.includes(k));
          if (newZoneKeys.length > 0) {
            if (!newData.zones) newData.zones = {};
            for (const k of newZoneKeys) {
              newData.zones[k] = zonesClone[k];
            }
          }
          return newData;
        },
      });

      return onClose();
    }

    onClose();
  };

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded shadow-lg flex flex-col min-w-[150px] py-1 text-sm"
      style={{ top: y, left: x }}
      onMouseLeave={onClose}
    >
      <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left" onClick={() => handleAction("rename")}>
        <Icon icon="lucide:type" width={14} /> Rename
      </button>
      <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left" onClick={() => handleAction("copy")}>
        <Icon icon="lucide:copy" width={14} /> Copy
      </button>
      <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left" onClick={() => handleAction("duplicate")}>
        <Icon icon="lucide:files" width={14} /> Duplicate
      </button>
      <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-600 text-left" onClick={() => handleAction("delete")}>
        <Icon icon="lucide:trash-2" width={14} /> Delete
      </button>
      <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left" onClick={() => handleAction("pasteBefore")}>
        <Icon icon="lucide:arrow-up" width={14} /> Paste Before
      </button>
      <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 text-left" onClick={() => handleAction("pasteAfter")}>
        <Icon icon="lucide:arrow-down" width={14} /> Paste After
      </button>
    </div>
  );
};

const LayerNode = ({
  item,
  zoneKey = "root",
  parentId = null,
  slotKey = null,
  depth = 0,
  index,
  dragState,
  setDragState,
  onContextMenu,
  editingId,
  setEditingId
}: any) => {
  const appState = usePuck((s) => s.appState);
  const dispatch = usePuck((s) => s.dispatch);
  const config = usePuck((s) => s.config);
  const selectedItem = usePuck((s) => s.selectedItem);
  const [isExpanded, setIsExpanded] = useState(true);
  const isCanvasHovered = useCanvasHover(item.props.id);

  const isSelected = selectedItem?.props.id === item.props.id;
  const componentConfig = config.components[item.type];
  const label =
    item.props?.metadata?.layerName ||
    componentConfig?.label ||
    item.type;

  const hasSelectedDescendant = (items: any[]): boolean => {
    return items.some(child =>
      child.props?.id === selectedItem?.props?.id ||
      hasSelectedDescendant(
        Object.values(child.props || {})
          .filter(Array.isArray)
          .flat()
      )
    );
  };

  const configSlots = Object.keys(componentConfig?.fields || {})
    .filter(k => componentConfig?.fields?.[k]?.type === "slot")
    .map(k => ({ type: 'zone', key: `${item.props.id}:${k}`, label: k, items: appState.data.zones?.[`${item.props.id}:${k}`] || [] }));

  const existingZones = Object.keys(appState.data.zones || {})
    .filter(z => z.startsWith(`${item.props.id}:`))
    .filter(z => !configSlots.find(c => c.key === z))
    .map(z => ({ type: 'zone', key: z, label: z.split(":")[1], items: appState.data?.zones?.[z] }));

  const arrayProps = Object.keys(item.props || {})
    .filter(k => {
      const isArrayField = componentConfig?.fields?.[k]?.type === "array";
      const hasComponentItems = Array.isArray(item.props[k]) && item.props[k].length > 0 && item.props[k][0]?.props?.id;
      return isArrayField || hasComponentItems;
    })
    .map(k => ({ type: 'prop', key: k, label: k, items: item.props[k] || [] }));

  const allChildrenLists = [...configSlots, ...existingZones, ...arrayProps];
  const acceptsSlots = allChildrenLists.length > 0;

  const handleDragStart = (e: DragEvent) => {
    e.stopPropagation();
    setDragState({ isDragging: true, id: item.props.id, targetId: null, position: null });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragState.isDragging || dragState.id === item.props.id) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;

    let position = "bottom";
    if (y < rect.height * 0.25) position = "top";
    else if (acceptsSlots && y >= rect.height * 0.25 && y <= rect.height * 0.75) position = "inside";

    setDragState((prev: any) => ({ ...prev, targetId: item.props.id, position }));
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragState.isDragging || dragState.id === item.props.id) return;

    const newData = JSON.parse(JSON.stringify(appState.data));
    const source = findListAndIndex(newData, dragState.id);

    if (!source) return;

    const [movedItem] = source.list.splice(source.index, 1);

    if (dragState.position === "inside" && acceptsSlots) {
      const targetItemSrc = findListAndIndex(newData, item.props.id);
      if (targetItemSrc) {
        const targetItem = targetItemSrc.list[targetItemSrc.index];
        const targetListDef = allChildrenLists[0];

        if (targetListDef.type === 'zone') {
          if (!newData.zones[targetListDef.key]) newData.zones[targetListDef.key] = [];
          newData.zones[targetListDef.key].push(movedItem);
        } else if (targetListDef.type === 'prop') {
          if (!targetItem.props[targetListDef.key]) targetItem.props[targetListDef.key] = [];
          targetItem.props[targetListDef.key].push(movedItem);
        }
      }
    } else {
      const target = findListAndIndex(newData, dragState.targetId);
      if (target) {
        let insertIndex = target.index;
        if (dragState.position === "bottom") insertIndex += 1;
        if (source.list === target.list && source.index < insertIndex) insertIndex -= 1;
        target.list.splice(insertIndex, 0, movedItem);
      }
    }

    dispatch({ type: "setData", data: newData });
    setDragState({ isDragging: false, id: null, targetId: null, position: null });
  };

  const childIsSelected = allChildrenLists.some(list =>
    hasSelectedDescendant(list.items || [])
  );

  const shouldRenderChildren = isSelected || childIsSelected || isExpanded;

  const itemZone = resolveZone(parentId, slotKey, zoneKey);

  return (
    <div className="flex flex-col w-full relative">
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={() => setDragState((prev: any) => ({ ...prev, isDragging: false, targetId: null }))}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu(e.clientX, e.clientY, item, index, itemZone);
        }}
        className={`flex items-center gap-2 py-1.5 px-2 cursor-pointer border border-transparent ${isSelected
          ? "bg-primary/10 text-primary"
          : isCanvasHovered
            ? "bg-primary/10 text-primary"
            : "hover:bg-gray-100 text-gray-700"
          }`}
        style={{
          paddingLeft: `${(depth * 12) + 8}px`,
          borderTopColor: dragState.targetId === item.props.id && dragState.position === "top" ? "#3b82f6" : "transparent",
          borderBottomColor: dragState.targetId === item.props.id && dragState.position === "bottom" ? "#3b82f6" : "transparent",
          backgroundColor: dragState.targetId === item.props.id && dragState.position === "inside" ? "#eff6ff" : undefined,
        }}
        onMouseEnter={(e) => {
          e.stopPropagation();
          setLayerHover(item.props.id);
        }}
        onMouseLeave={(e) => {
          e.stopPropagation();
          setLayerHover(null);
        }}
        onClick={(e) => {
          e.stopPropagation();

          // Signal PluginAutoSwitcher that this selection came from the layer panel.
          layerClickRef.timestamp = Date.now();

          dispatch({
            type: "setUi",
            ui: {
              itemSelector: {
                index,
                zone: itemZone,
              },
              plugin: { current: "layers" },
            },
          });
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditingId(item.props.id);
        }}
      >
        <div className="w-4 flex items-center justify-center shrink-0">
          {acceptsSlots && (
            <button
              className="p-0.5 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <Icon
                icon={isExpanded ? "lucide:chevron-down" : "lucide:chevron-right"}
                width={14}
              />
            </button>
          )}
        </div>
        <Icon icon="lucide:layout-grid" width={14} className="shrink-0" />
        {editingId === item.props.id ? (
          <input
            autoFocus
            className="text-sm leading-none truncate select-none flex-1 border-0 outline-0"
            defaultValue={label}
            onBlur={(e) => {
              const newName = e.target.value.trim();
              if (newName && newName !== label) {
                dispatch({
                  type: "setData",
                  data: (prev: any) => {
                    const newData = JSON.parse(JSON.stringify(prev));
                    const target = findListAndIndex(newData, item.props.id);
                    if (target) {
                      target.list[target.index].props = {
                        ...target.list[target.index].props,
                        metadata: {
                          ...target.list[target.index].props?.metadata,
                          layerName: newName,
                        },
                      };
                    }
                    return newData;
                  },
                });
              }
              setEditingId(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
              if (e.key === "Escape") {
                setEditingId(null);
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-sm leading-none truncate select-none flex-1">{label}</span>
        )}
      </div>

      {shouldRenderChildren && isExpanded &&
        allChildrenLists
          .filter(list => Array.isArray(list.items) && list.items.length > 0) // 🔥 key fix
          .map((list) => (
            <div key={list.key} className="flex flex-col w-full mt-1">
              <div
                className="flex items-center gap-2 py-1 px-2 text-xs text-gray-400 font-medium select-none"
                style={{ paddingLeft: `${((depth + 1) * 12) + 8}px` }}
              >
                {list.label}
              </div>

              {list.items.map((childItem: any, i: number) => (
                <LayerNode
                  key={childItem.props?.id || `${list.key}-${i}`}
                  item={childItem}
                  zoneKey={list.key.includes("zone") ? list.key : zoneKey}
                  parentId={item.props.id}
                  slotKey={list.key}
                  depth={depth + 1}
                  index={i}
                  dragState={dragState}
                  setDragState={setDragState}
                  onContextMenu={onContextMenu}
                  editingId={editingId}
                  setEditingId={setEditingId}
                />
              ))}
            </div>
          ))}
    </div>
  );
};

export const LayerPanel = () => {
  const appState = usePuck((s) => s.appState);
  const dispatch = usePuck((s) => s.dispatch);
  const config = usePuck((s) => s.config);
  const content = appState.data.content || [];

  const [dragState, setDragState] = useState({
    isDragging: false,
    id: null,
    targetId: null,
    position: null
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuInfo | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Start listening for canvas hover events on the preview iframe
  useEffect(() => startCanvasHoverTracking(), []);

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50 shrink-0 sticky top-0 z-10 w-full">
        <span className="font-semibold text-sm text-gray-800">Layers</span>
      </div>
      <div className="flex-1 overflow-y-auto w-full p-2" onDragOver={(e) => e.preventDefault()}>
        {content.length === 0 ? (
          <div className="text-sm text-gray-400 p-2">No items</div>
        ) : (
          content.map((item: any, index: number) => (
            <LayerNode
              key={item.props.id}
              item={item}
              zoneKey="root"
              depth={0}
              index={index}
              dragState={dragState}
              setDragState={setDragState}
              onContextMenu={(x: number, y: number, item: any, idx: number, zone: string) =>
                setContextMenu({ x, y, item, index: idx, zone })
              }
              editingId={editingId}
              setEditingId={setEditingId}
            />
          ))
        )}
      </div>
      {contextMenu && (
        <LayerContextMenu
          {...contextMenu}
          onClose={() => setContextMenu(null)}
          appState={appState}
          dispatch={dispatch}
          config={config}
          setEditingId={setEditingId}
        />
      )}
    </div>
  );
};

export const layerPlugin = {
  name: "layers",
  label: "Layers",
  icon: <Icon icon="lucide:layers" width={24} />,
  render: () => <LayerPanel />,
  mobileOnly: false,
};