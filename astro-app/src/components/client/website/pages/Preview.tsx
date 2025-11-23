import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Render, type Data } from "@measured/puck";
import { config } from "@lib/puck.config";
import { Icon } from "@iconify/react";
import { useEditorData } from "@stores/useEditorData";
import "@measured/puck/puck.css";

export default function PuckPreview() {
  const { slug, pagePath } = useParams<{ slug: string; pagePath: string }>();
  const { getPageData } = useEditorData();
  const storageKey = `${slug}-${pagePath}`;

  const [data, setData] = useState<Data | null>(null);
  const [source, setSource] = useState<"local" | "db" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      if (!slug || !pagePath) return;

      // 1. Try Local Storage first (Real-time preview)
      const localData = getPageData(storageKey);
      if (localData) {
        setData(localData);
        setSource("local");
        setIsLoading(false);
        return;
      }

      // 2. Fallback to Database
      try {
        const res = await fetch(
          `/api/websites/${slug}/pages/${pagePath}/editor-data`,
        );
        if (!res.ok) throw new Error("Failed to load page");
        const page = await res.json();
        setData(page.data);
        setSource("db");
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();

    // Optional: Listen for storage events to update preview in real-time if user has two windows open side-by-side
    const handleStorageChange = () => {
      const newData = getPageData(storageKey);
      if (newData) {
        setData(newData);
        setSource("local");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [slug, pagePath, getPageData, storageKey]);

  if (isLoading)
    return <div className="p-10 text-center">Loading preview...</div>;
  if (!data) return <div className="p-10 text-center">Page not found</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-gray-900 text-white flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            to={`/admin/websites/${slug}/pages/${pagePath}/editor`}
            className="flex items-center gap-2 text-sm font-medium hover:text-gray-300 transition-colors"
          >
            <Icon icon="lucide:arrow-left" width={18} />
            Back to Editor
          </Link>
          <div className="h-4 w-px bg-gray-700 mx-2"></div>
          <span className="text-xs text-gray-400 font-mono">
            Previewing: /{pagePath}
          </span>
          {source === "local" && (
            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black uppercase tracking-wider">
              Unsaved Draft
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
