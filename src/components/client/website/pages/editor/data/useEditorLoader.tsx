import { useParams } from "react-router-dom";
import { useWebsitesQuery } from "@/hooks/queries/useWebsitesQuery";
import { usePagesQuery } from "@/hooks/queries/usePagesQuery";
import { useEditorDataQuery } from "@/hooks/queries/useEditorDataQuery";

export function useEditorLoader() {
  const { subdomain, pagePath } = useParams();

  const { data: websites = [] } = useWebsitesQuery();
  const website = websites.find((w) => w.subdomain === subdomain);
  const websiteId = website?.id;

  const { data: pagesData, isLoading: pagesLoading } = usePagesQuery(websiteId);
  const pages = pagesData?.pages || [];
  const page = pages.find((p) => p.path === pagePath);
  const pageId = page?.id;

  const storageKey = websiteId && pageId ? `${websiteId}-${pageId}` : `${subdomain}-${pagePath}`;

  const { data, isLoading: editorLoading, error: editorError } = useEditorDataQuery(websiteId, pageId);

  return {
    data: data || { content: [], root: {} },
    loading: pagesLoading || editorLoading || (!!subdomain && !websiteId) || (!!pagePath && !pageId),
    error: editorError ? "Failed to load editor" : null,
    websiteId,
    pageId,
    storageKey,
  };
}