import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { Render, type Data } from "@puckeditor/core";
import { useConfig } from "@/lib";
import { Icon } from "@iconify/react";
import { useEditorData } from "@stores/useEditorData";
import { usePagesStore } from "@/stores/usePagesStore";
import "@puckeditor/core/puck.css";

export default function PuckPreview() {
  const config = useConfig();
  const { t } = useTranslation();
  const { subdomain, pagePath } = useParams<{ subdomain: string; pagePath: string }>();

  const { fetchPageByPath } = usePagesStore();
  const storageKey = `${subdomain}-${pagePath}`;

  // 1. Get data reactively from the store
  const localData = useEditorData((s) => s.pages[storageKey]);
  const [dbData, setDbData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Synchronize across tabs using storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "editor-data") {
        // Force Zustand to rehydrate from localStorage
        useEditorData.persist.rehydrate();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 3. Load DB data if not in local storage
  useEffect(() => {
    const loadFromDb = async () => {
      if (localData) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const page = await fetchPageByPath(subdomain!, pagePath!);
        if (page?.id) {
          const res = await fetch(
            `/api/websites/${page.website_id}/pages/${page.id}/editor-data`
          );
          const editorJson = await res.json();
          setDbData(editorJson.data);
        }
      } catch (error) {
        console.error("Failed to load preview data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromDb();
  }, [subdomain, pagePath, localData, fetchPageByPath]);

  // Priority: Local Draft > DB Data
  const data = localData || dbData;
  const source = localData ? "local" : "db";

  if (isLoading) return <div className="p-10 text-center">
    {t("websites_page.preview.loading")}
  </div>;
  if (!data) return <div className="p-10 text-center">
    {t("websites_page.preview.not_found")}
  </div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-gray-900 text-white flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/websites/${subdomain}/pages/${pagePath}/editor`}
            className="flex items-center gap-2 text-sm font-medium hover:text-gray-300 transition-colors"
          >
            <Icon icon="lucide:arrow-left" width={18} />
            {t("websites_page.preview.back_to_editor")}
          </Link>
          <div className="h-4 w-px bg-gray-700 mx-2"></div>
          <span className="text-xs text-gray-400 font-mono">
            {t("websites_page.preview.previewing")} /{pagePath}
          </span>
          {source === "local" && (
            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black uppercase tracking-wider">
              {t("websites_page.preview.unsaved_draft")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Device Toggles (Visual Only for now) */}
          <div className="hidden sm:flex items-center gap-2 text-gray-400">
            <Icon icon="ph:desktop" width={20} className="text-white" />
            <Icon icon="ph:device-tablet" width={20} />
            <Icon icon="ph:device-mobile" width={20} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-14">
        <Render config={config} data={data} />
      </div>
    </div>
  );
}
