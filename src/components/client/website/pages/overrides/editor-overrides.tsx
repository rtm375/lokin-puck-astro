import React, { useEffect } from "react";
import { Icon } from "@iconify/react";

// Factory function that returns Puck overrides
// This can be used in both client (with useMemo) and server (direct call)
export const puckOverrides = (
  handlePreview: () => void,
  t: (key: string) => string,
) => ({
  iframe: ({ children, document }: any) => {
    useEffect(() => {
      if (!document) return;

      const head = document.head;
      if (!head) return;

      if (!head.querySelector("#preview-frame-uno")) {
        const script = document.createElement("script");
        script.id = "preview-frame-uno";
        script.src = "https://cdn.jsdelivr.net/npm/@unocss/runtime";
        head.appendChild(script);
      }

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
    }, [document]);

    return <>{children}</>;
  },
  headerActions: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handlePreview}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          title="Preview (Includes unsaved changes)"
        >
          <Icon icon="iconoir:eye" width={18} />
          <span className="hidden sm:inline">
            {t("websites_page.editor.preview")}
          </span>
        </button>
        {children}
      </div>
    );
  },
});
