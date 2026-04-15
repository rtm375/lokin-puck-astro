import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useWebsitesQuery } from "@/hooks/queries/useWebsitesQuery";
import { usePagesQuery } from "@/hooks/queries/usePagesQuery";
import { useEditorDataQuery } from "@/hooks/queries/useEditorDataQuery";
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

  const { data: websites = [] } = useWebsitesQuery();
  const currentWebsite = websites.find((w) => w.subdomain === websiteSubdomain);
  const websiteId = currentWebsite?.id;

  const { data: pagesData, isLoading: pagesLoading } = usePagesQuery(websiteId);
  const pages = pagesData?.pages || [];
  const currentPage = pages.find((p) => p.path === pagePath);
  const pageId = currentPage?.id;

  const storageKey = `${websiteSubdomain}-${pagePath}`;

  const { data: editorData, isLoading: editorLoading } = useEditorDataQuery(websiteId, pageId);

  // Load editor data when query resolves
  useEffect(() => {
    if (!editorData || !websiteId || !pageId) return;
    if (pagesLoading || editorLoading) return;

    const localData = onGetLocalData(storageKey);
    const dataToUse = localData || editorData;
    onDataLoaded(dataToUse, storageKey);
  }, [editorData, websiteId, pageId, pagesLoading, editorLoading]);

  return {
    websiteId,
    pageId,
    currentWebsite,
    currentPage,
    pagesLoading,
    editorLoading,
  };
}
