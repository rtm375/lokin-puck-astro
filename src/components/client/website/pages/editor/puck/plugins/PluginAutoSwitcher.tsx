import React from "react";
import { createUsePuck } from "@puckeditor/core";

export const usePuck = createUsePuck();

// Timestamp-based signal: LayerNode sets this to Date.now() on click.
// PluginAutoSwitcher checks if a layer click happened within the last 300ms.
// Unlike a boolean flag, a timestamp survives multiple effect runs.
export const layerClickRef = { timestamp: 0 };

export const PluginAutoSwitcher = () => {
  const currentPlugin = usePuck((s) => s.appState.ui.plugin?.current);
  const selectedItem = usePuck((s) => s.appState.ui.itemSelector);
  const dispatch = usePuck((s) => s.dispatch);

  const selectedItemKey = selectedItem
    ? `${selectedItem.zone}:${selectedItem.index}`
    : null;

  const prevSelectedRef = React.useRef(selectedItemKey);

  React.useEffect(() => {
    if (selectedItemKey !== prevSelectedRef.current) {
      prevSelectedRef.current = selectedItemKey;

      // If a layer click happened recently (within 300ms), this selection
      // change originated from the layer panel — don't override the plugin.
      // A timestamp survives multiple effect re-runs unlike a boolean flag.
      if (Date.now() - layerClickRef.timestamp < 300) {
        return;
      }

      // Selection changed from a canvas click — switch to the appropriate panel.
      if (selectedItemKey) {
        dispatch({
          type: "setUi",
          ui: { leftSideBarVisible: true, plugin: { current: "fields" } },
        });
      } else {
        dispatch({
          type: "setUi",
          ui: { leftSideBarVisible: true, plugin: { current: "blocks" } },
        });
      }
    }
  }, [selectedItemKey, currentPlugin, dispatch]);

  return <></>;
};