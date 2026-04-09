import React from "react";
import { Icon } from "@iconify/react";
import { createUsePuck } from "@puckeditor/core";
import initUnocssRuntime from "@unocss/runtime";
import presetWind4 from "unocss/preset-wind4";
import { DrawerItem } from "./DrawerItem";
import type { Props } from "../blocks/types";

export const usePuck = createUsePuck();

// Timestamp-based signal: LayerNode sets this to Date.now() on click.
// PluginAutoSwitcher checks if a layer click happened within the last 300ms.
// Unlike a boolean flag, a timestamp survives multiple effect runs.
export const layerClickRef = { timestamp: 0 };

const IframeWrapper = ({ children, document: doc }: any) => {
  React.useEffect(() => {
    if (!doc) return;

    const head = doc.head;
    if (!head) return;

    if ((doc as any).__unocss_initialized) return;
    (doc as any).__unocss_initialized = true;
    head.querySelectorAll('style[data-unocss-runtime-layer]').forEach((el: any) => el.remove());

    initUnocssRuntime({
      defaults: {
        presets: [presetWind4()],
        theme: {
          colors: {
            primary: "#f3602a",
          },
        },
      },
      observer: {
        target: () => doc.documentElement,
      },
      rootElement: () => doc.documentElement,
      inject: (styleElement) => {
        head.appendChild(styleElement);
      },
    });

    const cleanupStyles = () => {
      head
        .querySelectorAll('style[data-vite-dev-id*="__uno.css"]')
        .forEach((el: any) => el.remove());

      head.querySelectorAll("style").forEach((el: any) => {
        if (el.innerHTML.includes("astro-island,astro-slot")) {
          el.remove();
        }
      });
    };

    cleanupStyles();

    const observer = new MutationObserver(cleanupStyles);
    observer.observe(head, { childList: true });

    return () => observer.disconnect();
  }, [doc]);

  return <>{children}</>;
};

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

// Factory function that returns Puck overrides
// This can be used in both client (with useMemo) and server (direct call)
export const puckOverrides = (
  handlePublish: (data: any) => void,
  t: (key: string) => string,
  hasUnsavedChanges: boolean,
  isSaving: boolean,
  onBack: () => void,
) => ({
  iframe: IframeWrapper,
  fields: ({ children }: any) => (
    <>{children}</>
  ),
  fieldLabel: ({ children }: any) => (
    <>{children}</>
  ),
  outline: () => <></>,
  drawerItem: ({ name }: { name: string }) => <DrawerItem name={name as keyof Props} />,
  header: ({ actions }: any) => {
    return (
      <div className="bg-white border-b border-gray-200 px-4 h-12 flex items-center justify-between shrink-0 z-10 w-screen">
        <div className="flex items-center gap-4 justify-between w-2/12">
          <button
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium"
          >
            <Icon icon="lucide:arrow-left" width={16} />
            {t("websites_page.editor.back_to_dashboard")}
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 flex-1">
          {hasUnsavedChanges && !isSaving && (
            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
              {t("websites_page.editor.unsaved_changes")}
            </span>
          )}
          {isSaving && (
            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
              {t("websites_page.editor.saving")}
            </span>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 w-2/12">
          {actions}
        </div>
      </div>
    );
  },
  headerActions: (): React.ReactElement => {
    const appState = usePuck((s) => s.appState);
    const dispatch = usePuck((s) => s.dispatch);
    const isInteractive = appState.ui.previewMode === "interactive";

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            dispatch({
              type: "setUi",
              ui: {
                leftSideBarVisible: !isInteractive ? false : true,
                previewMode: isInteractive ? "edit" : "interactive"
              },
            });
          }}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer border ${isInteractive
            ? "bg-primary text-white border-primary"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          title={
            isInteractive ? "Back to Edit" : "Preview (Includes unsaved changes)"
          }
        >
          <Icon icon={isInteractive ? "iconoir:eye-off" : "iconoir:eye"} width={18} />
          <span className="hidden sm:inline">
            {isInteractive ? "Exit Preview" : t("websites_page.editor.preview")}
          </span>
        </button>
        <button
          onClick={() => {
            handlePublish(appState.data);
          }}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary border border-primary rounded-md hover:bg-primary/80 transition-colors cursor-pointer"
          title="Publish (Includes unsaved changes)"
        >
          {isSaving ? (
            <Icon icon="line-md:loading-twotone-loop" width={18} />
          ) : (
            <Icon icon="iconoir:save-floppy-disk" width={18} />
          )}

          <span className="hidden sm:inline">
            {isSaving
              ? t("websites_page.editor.publishing")
              : t("websites_page.editor.publish")}
          </span>
        </button>
      </div>
    );
  },
});
