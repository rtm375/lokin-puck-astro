import React from "react";
import { Icon } from "@iconify/react";
import { createUsePuck } from "@puckeditor/core";
export const usePuck = createUsePuck();

const IframeWrapper = ({ children, document }: any) => {
  React.useEffect(() => {
    if (!document) return;

    const head = document.head;
    if (!head) return;

    if (!head.querySelector("#preview-frame-uno")) {
      const configScript = document.createElement("script");
      configScript.id = "preview-frame-uno-config";
      configScript.innerHTML = `
        window.__unocss = {
          theme: {
            colors: {
              primary: "#f3602a",
            },
            font: {
              lineHeight: "1",
            }
          }
        };
      `;
      head.appendChild(configScript);

      const script = document.createElement("script");
      script.id = "preview-frame-uno";
      script.src = "https://cdn.jsdelivr.net/npm/@unocss/runtime";
      head.appendChild(script);
    }

    const cleanupStyles = () => {
      head
        .querySelectorAll('style[data-vite-dev-id*="__uno.css"]')
        .forEach((el: Element) => el.remove());

      head.querySelectorAll("style").forEach((el: Element) => {
        if (el.innerHTML.includes("astro-island,astro-slot")) {
          el.remove();
        }
      });
    };

    cleanupStyles();

    const observer = new MutationObserver(cleanupStyles);
    observer.observe(head, { childList: true });

    return () => observer.disconnect();
  }, [document]);

  return children;
};

// Custom wrapper to track selection and switch left sidebar tabs automatically
const PluginAutoSwitcher = ({ children }: { children: React.ReactNode }) => {
  const selectedItem = usePuck((s) => s.appState.ui.itemSelector);
  const dispatch = usePuck((s) => s.dispatch);

  // Stringify the selection to ensure stable equality checks across renders
  const selectedItemKey = selectedItem
    ? `${selectedItem.zone}:${selectedItem.index}`
    : null;

  const prevSelectedRef = React.useRef(selectedItemKey);

  React.useEffect(() => {
    if (selectedItemKey !== prevSelectedRef.current) {
      if (selectedItemKey) {
        // Auto-switch to Fields (settings) when an item is selected
        dispatch({
          type: "setUi",
          ui: { leftSideBarVisible: true, plugin: { current: "fields" } },
        });
      } else {
        // Auto-switch back to Blocks when selection is cleared
        dispatch({
          type: "setUi",
          ui: { leftSideBarVisible: true, plugin: { current: "blocks" } },
        });
      }
      prevSelectedRef.current = selectedItemKey;
    }
  }, [selectedItemKey, dispatch]);

  return <>{children}</>;
};

// Factory function that returns Puck overrides
// This can be used in both client (with useMemo) and server (direct call)
export const puckOverrides = (
  handlePreview: () => void,
  handlePublish: (data: any) => void,
  t: (key: string) => string,
  hasUnsavedChanges: boolean,
  isSaving: boolean,
  onBack: () => void,
) => ({
  puck: PluginAutoSwitcher,
  iframe: IframeWrapper,
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
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handlePreview}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
          title="Preview (Includes unsaved changes)"
        >
          <Icon icon="iconoir:eye" width={18} />
          <span className="hidden sm:inline">
            {t("websites_page.editor.preview")}
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
