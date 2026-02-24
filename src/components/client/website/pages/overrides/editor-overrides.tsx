import React from "react";
import { Icon } from "@iconify/react";
import { createUsePuck } from "@measured/puck";
const usePuck = createUsePuck();

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
  // iframe: ({ children, document }: any) => {
  //   useEffect(() => {
  //     if (!document) return;

  //     const head = document.head;
  //     if (!head) return;

  //     if (!head.querySelector("base")) {
  //       const base = document.createElement("base");
  //       base.href = window.location.origin;
  //       head.prepend(base);
  //     }

  //     if (!head.querySelector("#preview-frame-uno")) {
  //       const script = document.createElement("script");
  //       script.id = "preview-frame-uno";
  //       script.src = "https://cdn.jsdelivr.net/npm/@unocss/runtime";
  //       head.appendChild(script);
  //     }

  //     const cleanupStyles = () => {
  //       head
  //         .querySelectorAll('style[data-vite-dev-id*="__uno.css"]')
  //         .forEach((el: any) => el.remove());

  //       head.querySelectorAll("style").forEach((el: any) => {
  //         if (el.innerHTML.includes("astro-island,astro-slot")) {
  //           el.remove();
  //         }
  //       });
  //     };

  //     cleanupStyles();

  //     const observer = new MutationObserver(cleanupStyles);
  //     observer.observe(head, { childList: true });

  //     return () => observer.disconnect();
  //   }, [document]);

  //   return <>{children}</>;
  // },
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
