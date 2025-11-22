import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { config } from "@lib/puck.config";
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useEditorData } from "@stores/useEditorData";

export default function PuckEditor() {
  const { slug, pagePath } = useParams<{ slug: string; pagePath: string }>();
  const navigate = useNavigate();

  // FIX: Selectors to prevent re-renders on store updates
  const setPageData = useEditorData((state) => state.setPageData);
  const getPageData = useEditorData((state) => state.getPageData);
  const clearPageData = useEditorData((state) => state.clearPageData);

  const storageKey = `${slug}-${pagePath}`;

  const [initialData, setInitialData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 1. Load Data
  useEffect(() => {
    const loadPage = async () => {
      if (!slug || !pagePath) return;

      try {
        const res = await fetch(
          `/api/websites/${slug}/pages/${pagePath}/editor-data`,
        );
        if (!res.ok) throw new Error("Failed to load page");
        const dbPage = await res.json();

        const dbData = dbPage.data || {
          root: { props: { title: dbPage.title || "New Page" } },
          content: [],
          zones: {},
        };

        // Check local storage for unsaved work
        const localData = getPageData(storageKey);

        if (localData) {
          console.log("Restored unsaved changes from local storage");
          setInitialData(localData);
          setHasUnsavedChanges(true);
        } else {
          setInitialData(dbData);
        }
      } catch (error) {
        console.error(error);
        alert("Could not load page data");
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [slug, pagePath]); // Removed getPageData from deps as it's stable now

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
    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/websites/${slug}/pages/${pagePath}/editor-save`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        },
      );

      if (!res.ok) throw new Error("Failed to save");

      clearPageData(storageKey);
      setHasUnsavedChanges(false);
      console.log("Published successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to save page");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    window.open(`/admin/websites/${slug}/pages/${pagePath}/preview`, "_blank");
  };

  if (isLoading)
    return <div className="p-10 text-center">Loading editor...</div>;
  if (!initialData)
    return <div className="p-10 text-center">Error loading editor</div>;

  return (
    <div className="h-screen w-full bg-white flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 h-12 flex items-center justify-between shrink-0 z-10">
        <button
          onClick={() => navigate(`/admin/websites/${slug}/pages`)}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium"
        >
          <Icon icon="lucide:arrow-left" width={16} />
          Back to Dashboard
        </button>

        {hasUnsavedChanges && (
          <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
            Unsaved changes stored locally
          </span>
        )}
      </div>

      <div className="grow overflow-hidden">
        <Puck
          config={config}
          data={initialData}
          onPublish={handlePublish}
          onChange={handleChange}
          headerPath={slug}
          overrides={{
            headerActions: ({ children }) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title="Preview (Includes unsaved changes)"
                >
                  <Icon icon="iconoir:eye" width={18} />
                  <span className="hidden sm:inline">Preview</span>
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
