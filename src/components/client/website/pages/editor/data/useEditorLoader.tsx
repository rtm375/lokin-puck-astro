import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useWebsitesStore } from "@/stores/useWebsitesStore";
import { usePagesStore } from "@/stores/usePagesStore";
import { useEditorData } from "@stores/useEditorData";

export function useEditorLoader() {
  const { subdomain, pagePath } = useParams();

  const { websites, fetchWebsites } = useWebsitesStore();
  const { pages, fetchPages, isLoading: pagesLoading } = usePagesStore();
  const { fetchEditorData } = useEditorData();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const website = websites.find((w) => w.subdomain === subdomain);
  const websiteId = website?.id;

  const page = pages.find((p) => p.path === pagePath);
  const pageId = page?.id;

  // Use the same key format as the store: websiteId-pageId
  const storageKey = websiteId && pageId ? `${websiteId}-${pageId}` : `${subdomain}-${pagePath}`;

  useEffect(() => {
    if (!websites.length) fetchWebsites();
  }, []);

  useEffect(() => {
    if (websiteId) fetchPages(websiteId);
  }, [websiteId]);

  useEffect(() => {
    if (!websiteId || pagesLoading || !pageId) return;

    (async () => {
      try {
        const res = await fetchEditorData(websiteId, pageId);
        setData(res);
      } catch {
        setError("Failed to load editor");
      } finally {
        setLoading(false);
      }
    })();
  }, [websiteId, pageId, pagesLoading]);

  return { data, loading, error, websiteId, pageId, storageKey };
}