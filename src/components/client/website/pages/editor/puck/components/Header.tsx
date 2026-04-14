import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import { useEditorContext } from "../../core/editorProvider";

export const Header = ({ actions }: { actions: React.ReactNode }) => {
  const { t } = useTranslation();
  const context = useEditorContext();

  if (!context) return <>Ha kosong??? </>;
  const { onBack, hasUnsavedChanges, isSaving } = context;

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
};