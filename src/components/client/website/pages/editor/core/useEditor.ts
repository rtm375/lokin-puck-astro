import { useCallback, useState } from "react";
import { useEditorLoader } from "@/components/client/website/pages/editor/data/useEditorLoader";
import { useEditorPersistence } from "../data/useEditorPersistence";
import { publishPage } from "../publish/publishPage";
import { useConfig } from "@/components/client/website/pages/editor/puck/config";
import { useParams } from "react-router-dom";
import { useEditorData } from "@stores/useEditorData";

export function useEditor() {
  const config = useConfig();
  const { subdomain } = useParams<{ subdomain: string }>();
  const { setPageData } = useEditorData();

  const {
    data,
    loading,
    error,
    websiteId,
    pageId,
    storageKey,
  } = useEditorLoader();

  const {
    pendingData,
    setPendingData,
    hasUnsavedChanges,
    setHasUnsavedChanges,
  } = useEditorPersistence(storageKey);

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = useCallback((data: any) => {
    setPendingData(data);
    setHasUnsavedChanges(true);
  }, [setPendingData, setHasUnsavedChanges]);

  const handlePublish = useCallback(async (data: any) => {
    if (!pageId || !websiteId) return;

    setIsSaving(true);
    try {
      await publishPage({ config, data, websiteId, pageId });
      
      // Update the store with the published data
      setPageData(storageKey, data);
      
      setHasUnsavedChanges(false);
    } finally {
      setIsSaving(false);
    }
  }, [config, websiteId, pageId, storageKey, setPageData, setHasUnsavedChanges]);

  const onBack = useCallback(() => {
    window.location.href = `/admin/websites/${subdomain}`;
  }, [subdomain]);

  return {
    data: data || pendingData,
    loading,
    error,
    isSaving,
    hasUnsavedChanges,
    handleChange,
    handlePublish,
    setHasUnsavedChanges,
    onBack,
  };
}