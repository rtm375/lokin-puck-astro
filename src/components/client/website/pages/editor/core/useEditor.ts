import { useCallback, useState } from "react";
import { useEditorLoader } from "@/components/client/website/pages/editor/data/useEditorLoader";
import { useEditorPersistence } from "../data/useEditorPersistence";
import { useConfig } from "@/components/client/website/pages/editor/puck/config";
import { useParams } from "react-router-dom";
import { useEditorData } from "@stores/useEditorData";
import { useSaveEditorMutation } from "@/hooks/queries/useEditorDataQuery";

export function useEditor() {
  const config = useConfig();
  const { subdomain } = useParams<{ subdomain: string }>();
  const { markSaved, discardDraft, _savedAt } = useEditorData();

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

  const saveMutation = useSaveEditorMutation(websiteId, pageId);
  const [showConflictDialog, setShowConflictDialog] = useState(false);

  const handleChange = useCallback((data: any) => {
    setPendingData(data);
    setHasUnsavedChanges(true);
  }, [setPendingData, setHasUnsavedChanges]);

  const handlePublish = useCallback(async (data: any, force = false) => {
    if (!pageId || !websiteId) return;

    try {
      const result = await saveMutation.mutateAsync({
        data,
        _savedAt: force ? null : _savedAt,
      });
      
      markSaved(result.updatedAt || new Date().toISOString());
      setHasUnsavedChanges(false);
      setShowConflictDialog(false);
    } catch (err: any) {
      if (err.message === "CONFLICT" || err.status === 409) {
        setShowConflictDialog(true);
      } else {
        alert(err.message || "Failed to save");
      }
    }
  }, [websiteId, pageId, _savedAt, markSaved, setHasUnsavedChanges, saveMutation]);

  const handleReload = useCallback(() => {
    discardDraft();
    window.location.reload();
  }, [discardDraft]);

  const onBack = useCallback(() => {
    window.location.href = `/admin/websites/${subdomain}`;
  }, [subdomain]);

  return {
    data: data || pendingData,
    loading,
    error,
    isSaving: saveMutation.isPending,
    hasUnsavedChanges,
    showConflictDialog,
    setShowConflictDialog,
    handleChange,
    handlePublish,
    handleReload,
    setHasUnsavedChanges,
    onBack,
  };
}