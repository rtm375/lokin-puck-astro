import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWebsitesStore } from "@/stores/useWebsitesStore";
import { usePagesStore } from "@/stores/usePagesStore";
import { useEditorData } from "@stores/useEditorData";
import type { Data } from "@puckeditor/core";
import type { Props, RootProps } from "../puck/blocks/types";

interface EditorSetupResult {
  websiteId: string | undefined;
  pageId: string | undefined;
  currentWebsite: any;
  currentPage: any;
  pagesLoading: boolean;
  editorLoading: boolean;
}

export function useEditorSetup(
  onDataLoaded: (data: Data<Props, RootProps>, storageKey: string) => void,
  onGetLocalData: (storageKey: string) => Data<Props, RootProps> | null,
): EditorSetupResult {
  const { subdomain: websiteSubdomain, pagePath } = useParams<{
    subdomain: string;
    pagePath: string;
  }>();

  const { websites, fetchWebsites } = useWebsitesStore();
  const { pages, fetchPages, isLoading: pagesLoading } = usePagesStore();
  const { fetchEditorData, isLoading: editorLoading } = useEditorData();

  const currentWebsite = websites.find((w) => w.subdomain === websiteSubdomain);
  const websiteId = currentWebsite?.id;

  const currentPage = pages.find((p) => p.path === pagePath);
  const pageId = currentPage?.id;

  const storageKey = `${websiteSubdomain}-${pagePath}`;

  // Fetch websites on mount if empty
  useEffect(() => {
    if (websites.length === 0) {
      fetchWebsites();
    }
  }, [websites.length, fetchWebsites]);

  // Fetch pages when website changes
  useEffect(() => {
    if (websiteId) {
      fetchPages(websiteId);
    }
  }, [websiteId, fetchPages]);

  // Load editor data
  useEffect(() => {
    if (!websiteId) return;
    if (pagesLoading) return;
    if (!pageId && pages.length > 0) return;
    if (!pageId) return;

    const loadPage = async () => {
      const dbData = await fetchEditorData(websiteId, pageId);
      if (!dbData) return;

      const localData = onGetLocalData(storageKey);
      const dataToUse = localData || dbData;

      onDataLoaded(dataToUse, storageKey);
    };

    loadPage();
  }, [
    websites.length,
    websiteId,
    websiteSubdomain,
    pageId,
    pagesLoading,
    pages.length,
    pagePath,
    fetchEditorData,
    onDataLoaded,
    onGetLocalData,
    storageKey,
  ]);

  return {
    websiteId,
    pageId,
    currentWebsite,
    currentPage,
    pagesLoading,
    editorLoading,
  };
}
