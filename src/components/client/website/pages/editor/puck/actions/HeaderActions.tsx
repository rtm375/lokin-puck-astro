import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import { createUsePuck } from "@puckeditor/core";
import type { Data } from "@puckeditor/core";
import type { Props, RootProps } from "../blocks/types";
import { useEditorContext } from "../../core/editorProvider";

export const usePuck = createUsePuck();

export const HeaderActions = (): React.ReactElement => {
  const { t } = useTranslation();
  const appState = usePuck((s) => s.appState);
  const dispatch = usePuck((s) => s.dispatch);
  const isInteractive = appState.ui.previewMode === "interactive";
  const context = useEditorContext();

  if (!context) return <></>;
  const { handlePublish, isSaving } = context;

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
          handlePublish(appState.data as Data<Props, RootProps>);
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
};