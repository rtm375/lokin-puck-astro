import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "@/assets/css/global.css";
import { useConfig } from "@/lib";
import type {
  Props,
  RootProps,
} from "@components/client/website/pages/blocks/types";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";

import { useEditorData } from "@stores/useEditorData";
import { useWebsitesStore } from "@/stores/useWebsitesStore";
import { usePagesStore } from "@/stores/usePagesStore";
import { puckOverrides, PluginAutoSwitcher, usePuck } from "./overrides/editor-overrides";
import { PUCK_VIEWPORTS } from "./config/viewports";
import { api } from "@/lib/client";
import { Icon } from "@iconify/react";

import { layerPlugin } from "./overrides/layer";

// Custom Settings Panel that Elementor-ifies the Fields view
const SettingsPanel = () => {
  const selectedItem = usePuck((s) => s.selectedItem);
  const dispatch = usePuck((s) => s.dispatch);
  const config = usePuck((s) => s.config);

  // Get human-readable title from component config
  const title = selectedItem
    ? config.components[selectedItem.type]?.label || selectedItem.type
    : "Element Settings";

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50 shrink-0 sticky top-0 z-10 w-full">
        <button
          className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          onClick={() => {
            dispatch({
              type: "setUi",
              ui: { itemSelector: null },
            });
            dispatch({
              type: "setUi",
              ui: { plugin: { current: "blocks" } },
            });
          }}
          title="Back to elements"
        >
          <Icon icon="lucide:arrow-left" width={18} />
        </button>
        <span className="font-semibold text-sm text-gray-800">
          Edit {title}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto w-full">
        <Puck.Fields />
      </div>
    </div>
  );
};

const editorPlugins = [
  {
    name: "fields",
    label: "Settings",
    icon: <Icon icon="lucide:settings" width={18} />,
    render: () => <SettingsPanel />,
    mobileOnly: false,
  },
];

export default function PuckEditor() {
  const config = useConfig();
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

  const {
    setPageData,
    getPageData,
    clearPageData,
    fetchEditorData,
    isLoading: editorLoading,
  } = useEditorData();

  const storageKey = `${websiteSubdomain}-${pagePath}`;

  const [initialData, setInitialData] = useState<Data<Props, RootProps> | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 1. Load Data - wait for pages to load first
  useEffect(() => {
    // Check if website exists
    if (!websiteId) {
      return;
    }

    // Wait for pages to finish loading
    if (pagesLoading) return;

    // If pages loaded but page not found, return (error will show after loading)
    if (!pageId && pages.length > 0) {
      return;
    }

    // Need pageId to proceed
    if (!pageId) return;

    const loadPage = async () => {
      // Fetch from store (with smart caching) using pageId
      const dbData = await fetchEditorData(websiteId, pageId);

      if (!dbData) {
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

  // 2. Optimized Change Handler with Debounce
  const [pendingData, setPendingData] = useState<Data<Props, RootProps> | null>(
    null,
  );

  // Debounce saving to local storage
  useEffect(() => {
    if (!pendingData) return;

    const timer = setTimeout(() => {
      setPageData(storageKey, pendingData);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [pendingData, storageKey, setPageData]);

  const handleChange = useCallback(
    (data: Data<Props, RootProps>) => {
      setPendingData(data);
      // Only update if currently false to avoid unnecessary re-renders
      setHasUnsavedChanges((prev) => prev || true);
    },
    [],
  );

  // 3. Publish
  const handlePublish = useCallback(
    async (data: Data<Props, RootProps>) => {
      if (!pageId) {
        alert(t("websites_page.editor.page_not_found"));
        return;
      }

      setIsSaving(true);
      try {
        await api.post(
          `/api/websites/${websiteId}/pages/${pageId}/editor-save`,
          { data },
        );

        const cacheKey = `${websiteId}-${pageId}`;
        setPageData(cacheKey, data);

        clearPageData(storageKey);
        setPendingData(null); // Clear pending changes
        setHasUnsavedChanges(false);
        console.log(t("websites_page.editor.publish_success"));
      } catch (error) {
        console.error(error);
        alert(t("websites_page.editor.save_error"));
      } finally {
        setIsSaving(false);
      }
    },
    [pageId, websiteId, t, setPageData, clearPageData, storageKey],
  );


  // Memoize overrides to prevent recreating on every render
  const memoizedOverrides = useMemo(
    () => ({
      ...puckOverrides(
        handlePublish,
        t,
        hasUnsavedChanges,
        isSaving,
        () => navigate(`/admin/websites/${websiteSubdomain}/pages`),
      ),
      // Render PluginAutoSwitcher inside the Puck tree so usePuck is valid
      puck: ({ children }: { children: React.ReactNode }) => (
        <>
          <PluginAutoSwitcher />
          {children}
        </>
      ),
    }),
    [
      handlePublish,
      t,
      hasUnsavedChanges,
      isSaving,
      navigate,
      websiteSubdomain,
    ],
  );

  if (pagesLoading || editorLoading || (websiteId && pageId && !initialData))
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
      <div className="grow overflow-hidden">
        <Puck
          _experimentalFullScreenCanvas={false}
          _experimentalVirtualization={true}
          key={storageKey}
          config={config}
          data={initialData}
          onPublish={handlePublish}
          onChange={handleChange}
          headerPath={websiteSubdomain}
          overrides={memoizedOverrides}
          viewports={PUCK_VIEWPORTS}
          plugins={[...editorPlugins, layerPlugin]}
          ui={{
            leftSideBarWidth: 240,
            rightSideBarVisible: false
          }}
        />
      </div>
    </div >
  );
}
