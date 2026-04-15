import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { slugify } from "@utils";
import { useProfileQuery } from "@/hooks/queries/useProfileQuery";
import { useWebsitesQuery, useCreateWebsiteMutation } from "@/hooks/queries/useWebsitesQuery";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { QueryProvider } from "@/providers/QueryProvider";

// Internal content component that uses hooks
function WebsitesListContent() {
  const { data: profile } = useProfileQuery();
  const { data: websites = [] } = useWebsitesQuery();
  const createWebsite = useCreateWebsiteMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const tier = profile?.tier || "free";

  const { t, i18n } = useTranslation();
  const loaded = i18n.isInitialized;

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    description: "",
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, subdomain: slugify(prev.name) }));
  }, [formData.name]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWebsite.mutateAsync(formData);
      setIsModalOpen(false);
      setFormData({ name: "", subdomain: "", description: "" });
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!profile || !loaded) {
    return (
      <div className="p-10 text-center animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-48 bg-gray-100 rounded-lg"></div>
          <div className="h-48 bg-gray-100 rounded-lg"></div>
          <div className="h-48 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Website Cards */}
        {websites.map((site) => (
          <div
            key={site.id}
            className="block group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200"
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100">
              {/* Placeholder Image */}
              <div className="flex h-full text-gray-400">
                <img
                  src={`https://picsum.photos/seed/${site.id}/400/300`}
                  className="w-full h-full object-cover"
                  alt={site.name}
                />
              </div>

              {/* Overlay Actions */}
              <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/10 transition-opacity flex items-center justify-center">
                <div className="inline-flex shadow-sm rounded-md">
                  <a
                    href={`/admin/websites/${site.subdomain}/pages`}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {t("websites_page.actions.open")}
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {site.name || "Untitled"}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{site.subdomain}.lokin.id</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${site.status === "ONLINE" ? "bg-green-500" : site.status === "OFFLINE" ? "bg-red-500" : "bg-yellow-500"}`}
                >
                  {site.status}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* "New Website" Button Card */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center justify-center cursor-pointer min-h-[240px] rounded-lg border-2 border-dashed border-gray-300 p-12 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
        >
          <div className="p-3 bg-gray-100 rounded-full text-gray-400 group-hover:text-gray-600 transition-colors">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <span className="mt-4 block text-sm font-bold text-gray-900">
            {t("websites_page.create_new")}
          </span>
        </button>
      </div>

      {/* modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {t("websites_page.modal_title")}
            </h2>
            {tier == "free" && websites.length >= 1 && (
              <div className="text-sm rounded-md mb-4 p-2 border border-primary/40 bg-primary/20">
                <span
                  dangerouslySetInnerHTML={{
                    __html: t("websites_page.limit_reached", {
                      url: "/admin/billing",
                    }),
                  }}
                />
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-bold mb-1">
                  {t("websites_page.field_name")}
                </label>
                <input
                  type="text"
                  required
                  disabled={tier == "free" && websites.length >= 1}
                  placeholder="My Awesome Site"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm disabled:opacity-50"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-bold mb-1">
                  {t("websites_page.field_slug")}
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    required
                    disabled={tier == "free" && websites.length >= 1}
                    className="mt-1 block w-full rounded-l-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm disabled:opacity-50"
                    value={formData.subdomain}
                    onChange={(e) => {
                      setFormData({ ...formData, subdomain: e.target.value });
                    }}
                  />
                  <input
                    type="text"
                    disabled
                    className="mt-1 w-24 pointer-events-none block rounded-r-md border border-gray-300 px-3 py-2 shadow-sm bg-gray-100 text-gray-500 sm:text-sm"
                    value=".lokin.id"
                    readOnly
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Unique address for your site dashboard.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-bold mb-1">
                  {t("websites_page.field_description")} (
                  {t("common.optional")})
                </label>
                <textarea
                  placeholder="A short description of your site..."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm disabled:opacity-50"
                  value={formData.description}
                  disabled={tier == "free" && websites.length >= 1}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-start gap-3 mt-8">
                <button
                  type="submit"
                  disabled={
                    createWebsite.isPending || (tier == "free" && websites.length >= 1)
                  }
                  className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {createWebsite.isPending
                    ? t("websites_page.actions.creating")
                    : t("websites_page.actions.create")}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Entry point component with providers
export default function WebsitesList() {
  return (
    <QueryProvider>
      <LanguageProvider>
        <WebsitesListContent />
      </LanguageProvider>
    </QueryProvider>
  );
}
