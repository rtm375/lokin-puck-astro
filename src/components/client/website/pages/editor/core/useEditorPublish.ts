import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { Data } from "@puckeditor/core";
import type { Props, RootProps } from "../puck/blocks/types";
import { publishPage } from "../publish/publishPage";

interface PublishOptions {
  config: any;
  websiteId: string | undefined;
  pageId: string | undefined;
  onSuccess: () => void;
  onError: () => void;
  setIsSaving: (saving: boolean) => void;
  setPageData: (key: string, data: Data<Props, RootProps>) => void;
  clearLocalStorage: () => void;
}

export function useEditorPublish({
  config,
  websiteId,
  pageId,
  onSuccess,
  onError,
  setIsSaving,
  setPageData,
  clearLocalStorage,
}: PublishOptions) {
  const { t } = useTranslation();

  const handlePublish = useCallback(
    async (data: Data<Props, RootProps>) => {
      if (!pageId) {
        alert(t("websites_page.editor.page_not_found"));
        return;
      }

      setIsSaving(true);
      try {
        await publishPage({ config, data, websiteId, pageId });

        const cacheKey = `${websiteId}-${pageId}`;
        setPageData(cacheKey, data);

        clearLocalStorage();
        onSuccess();
        console.log(t("websites_page.editor.publish_success"));
      } catch (error) {
        console.error(error);
        alert(t("websites_page.editor.save_error"));
        onError();
      } finally {
        setIsSaving(false);
      }
    },
    [pageId, websiteId, t, setPageData, clearLocalStorage, config, onSuccess, onError, setIsSaving],
  );

  return { handlePublish };
}
