import { Icon } from "@iconify/react";
import { Puck } from "@puckeditor/core";
import { usePuck } from "@components/client/website/pages/editor/puck/config";

export const SettingsPanel = () => {
  const selectedItem = usePuck((s) => s.selectedItem);
  const dispatch = usePuck((s) => s.dispatch);
  const config = usePuck((s) => s.config);

  const title = selectedItem
    ? config.components[selectedItem.type]?.label || selectedItem.type
    : "Element Settings";

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50 shrink-0 sticky top-0 z-10 w-full">
        <button
          className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          onClick={() => {
            dispatch({
              type: "setUi",
              ui: { itemSelector: null },
            });
            dispatch({
              type: "setUi",
              ui: { plugin: { current: "blocks" } },
            });
          }}
          title="Back to elements"
        >
          <Icon icon="lucide:arrow-left" width={18} />
        </button>
        <span className="font-semibold text-sm text-gray-800">
          Edit {title}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden h-full w-full no-scrollbar">
        <Puck.Fields />
      </div>
    </div>
  );
};
