import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { config } from "@lib/puck.config";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useEditorData } from "@stores/useEditorData";
import { useWebsitesStore } from "@/stores/useWebsitesStore";
import { usePagesStore, type Page } from "@/stores/usePagesStore";

export default function PuckEditor() {
  const { t } = useTranslation();
  const { subdomain: websiteSubdomain, pagePath } = useParams<{
    subdomain: string;
    pagePath: string;
  }>();

  const { websites, fetchWebsites } = useWebsitesStore();
  const navigate = useNavigate();

  // Fetch websites on mount if empty (cold start)
  useEffect(() => {
    if (websites.length === 0) {
      fetchWebsites();
    }
  }, [websites.length, fetchWebsites]);

  const currentWebsite = websites.find((w) => w.subdomain === websiteSubdomain);
  const websiteId = currentWebsite?.id;

  const { pages, fetchPages, isLoading: pagesLoading } = usePagesStore();

  // Fetch pages on mount
  useEffect(() => {
    if (websiteId) {
      fetchPages(websiteId);
    }
  }, [websiteId, fetchPages]);

  // Find the page by path to get its ID
  const currentPage = pages.find((p) => p.path === pagePath);
  const pageId = currentPage?.id;

  const { setPageData, getPageData, clearPageData, fetchEditorData } =
    useEditorData();

  const storageKey = `${websiteSubdomain}-${pagePath}`;

  const [initialData, setInitialData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 1. Load Data - wait for pages to load first
  useEffect(() => {
    // Check if website exists
    if (!websiteId) {
      setIsLoading(false);
      return;
    }

    // Wait for pages to finish loading
    if (pagesLoading) return;

    // If pages loaded but page not found, show error
    if (!pageId && pages.length > 0) {
      setIsLoading(false);
      return;
    }

    // Need pageId to proceed
    if (!pageId) return;

    const loadPage = async () => {
      // Fetch from store (with smart caching) using pageId
      const dbData = await fetchEditorData(websiteId, pageId);

      if (!dbData) {
        setIsLoading(false);
        return;
      }

      // Check local storage for unsaved work
      const localData = getPageData(storageKey);

      if (localData) {
        setInitialData(localData);
        setHasUnsavedChanges(true);
      } else {
        setInitialData(dbData);
      }

      setIsLoading(false);
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
    storageKey,
    fetchEditorData,
    getPageData,
  ]);

  // 2. Optimized Change Handler
  const handleChange = useCallback(
    (data: Data) => {
      // This updates the store, but because we used a selector for setPageData,
      // this component will NOT re-render.
      setPageData(storageKey, data);
      setHasUnsavedChanges(true);
    },
    [storageKey, setPageData],
  );

  // 3. Publish
  const handlePublish = async (data: Data) => {
    if (!pageId) {
      alert(t("websites_page.editor.page_not_found"));
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/websites/${websiteId}/pages/${pageId}/editor-save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        },
      );

      if (!res.ok) throw new Error("Failed to save");

      clearPageData(storageKey);
      setHasUnsavedChanges(false);
      console.log(t("websites_page.editor.publish_success"));
    } catch (error) {
      console.error(error);
      alert(t("websites_page.editor.save_error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    window.open(
      `/admin/websites/${websiteSubdomain}/pages/${pagePath}/preview`,
      "_blank",
    );
  };

  if (isLoading)
    return (
      <div className="p-10 text-center">
        {t("websites_page.editor.loading")}
      </div>
    );

  if (!initialData)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
        <div className="text-red-600 mb-4">
          {!websiteId
            ? t("websites_page.editor.error_website_not_found", {
                subdomain: `/${websiteSubdomain}`,
              })
            : t("websites_page.editor.error_page_not_found", {
                path: `/${pagePath}`,
              })}
        </div>
        <button
          onClick={() => (window.location.href = "/admin/websites")}
          className="cursor-pointer text-sm text-primary hover:underline"
        >
          ← {t("websites_page.editor.back_to_dashboard")}
        </button>
      </div>
    );

  return (
    <div className="h-screen w-full bg-white flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 h-12 flex items-center justify-between shrink-0 z-10">
        <button
          onClick={() => navigate(`/admin/websites/${websiteSubdomain}/pages`)}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium"
        >
          <Icon icon="lucide:arrow-left" width={16} />
          {t("websites_page.editor.back_to_dashboard")}
        </button>

        {hasUnsavedChanges && (
          <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
            {t("websites_page.editor.unsaved_changes")}
          </span>
        )}
      </div>

      <div className="grow overflow-hidden">
        <Puck
          config={config}
          data={initialData}
          onPublish={handlePublish}
          onChange={handleChange}
          headerPath={websiteSubdomain}
          overrides={{
            headerActions: ({ children }) => (
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
            ),
          }}
        />
      </div>
    </div>
  );
}
