import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { api } from "@/lib/client";
import { useWebsitesStore } from "@/stores/useWebsitesStore";
import { usePagesStore, type Page } from "@/stores/usePagesStore";

export default function Pages() {
  const { t } = useTranslation();
  const { subdomain: websiteSubdomain } = useParams<{ subdomain: string }>();
  const { websites } = useWebsitesStore();
  const currentWebsite = websites.find((w) => w.subdomain === websiteSubdomain);
  const websiteId = currentWebsite?.id;

  const {
    pages,
    isLoading,
    fetchPages,
    addPage,
    updatePage,
    deletePage,
    currentPage,
    totalPages,
    total,
    setCurrentPage,
  } = usePagesStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  useEffect(() => {
    if (websiteId) {
      fetchPages(websiteId, currentPage);
    }
  }, [websiteId, currentPage, fetchPages]);

  // --- Actions ---
  const handleDelete = async (pageId: string) => {
    if (!confirm(t("websites_page.pages.confirm_delete"))) return;

    try {
      await api.delete(`/api/websites/${websiteId}/pages/${pageId}`);

      // Update local state
      deletePage(pageId);
      if (editingPage?.id === pageId) setIsModalOpen(false);
    } catch (error) {
      alert(t("websites_page.pages.delete_error"));
    }
  };

  const openCreateModal = () => {
    setEditingPage(null);
    setIsModalOpen(true);
  };

  const openSettingsModal = (page: Page) => {
    setEditingPage(page);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {t("websites_page.pages.title")}
        </h2>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:opacity-90 transition"
        >
          <Icon icon="mingcute:add-fill" width={18} />
          {t("websites_page.pages.add_new")}
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                {t("websites_page.pages.table.preview")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("websites_page.pages.table.title")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                {t("websites_page.pages.table.status")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                {t("websites_page.pages.table.last_edited")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                {t("websites_page.pages.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  {t("websites_page.pages.table.loading")}
                </td>
              </tr>
            ) : pages.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  {t("websites_page.pages.table.empty")}
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 group transition">
                  {/* Featured Image */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-10 w-16 bg-gray-100 rounded overflow-hidden border border-gray-200">
                      {page.image_url ? (
                        <img
                          src={page.image_url}
                          alt={page.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                          <Icon icon="iconoir:image" width={20} />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title & Path */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <Link
                        to={`/admin/websites/${websiteSubdomain}/pages/${page.path}/editor`}
                        className="text-sm font-medium text-gray-900 hover:text-primary hover:underline"
                      >
                        {page.title || t("websites_page.pages.table.untitled")}
                      </Link>
                      <span className="text-xs text-gray-400 font-mono mt-0.5">
                        /{page.path}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        page.status === "published"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {page.status === "published"
                        ? t("websites_page.pages.table.active")
                        : t("websites_page.pages.table.draft")}
                    </span>
                  </td>

                  {/* Last Edited */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(page.updated_at), "MMM d, yyyy HH:mm")}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        to={`/admin/websites/${websiteSubdomain}/pages/${page.path}/editor`}
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-md transition"
                        title="Open Editor"
                      >
                        <Icon icon="ph:paint-brush-broad-duotone" width={18} />
                      </Link>
                      <button
                        onClick={() => openSettingsModal(page)}
                        className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition"
                        title="Settings"
                      >
                        <Icon icon="solar:settings-linear" width={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && pages.length > 0 && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {pages.length} of {total} pages
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Icon icon="mingcute:left-line" width={16} className="inline" />{" "}
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next{" "}
              <Icon icon="mingcute:right-line" width={16} className="inline" />
            </button>
          </div>
        </div>
      )}

      {/* Settings/Create Modal */}
      {isModalOpen && (
        <PageSettingsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          page={editingPage}
          websiteSubdomain={websiteSubdomain!}
          websiteId={websiteId}
          onSuccess={(updatedPage, isNew) => {
            if (isNew) {
              addPage(updatedPage);
            } else {
              updatePage(updatedPage);
            }
            setIsModalOpen(false);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

// --- Sub Component: Page Settings Modal ---
interface PageSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  page: Page | null;
  websiteSubdomain: string;
  websiteId?: string;
  onSuccess: (page: Page, isNew: boolean) => void;
  onDelete: (id: string) => void;
}

const PageSettingsModal = ({
  isOpen,
  onClose,
  page,
  websiteId,
  onSuccess,
  onDelete,
}: PageSettingsProps) => {
  const { t } = useTranslation();
  const isNew = !page;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: page?.title || "",
    path: page?.path || "",
    description: page?.description || "",
    status: page?.status || "draft",
    image_url: page?.image_url || "",
    head_code: page?.head_code || "",
  });

  // Auto-generate subdomain from title for new pages
  useEffect(() => {
    if (isNew && formData.title) {
      setFormData((prev) => ({
        ...prev,
        path: prev.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      }));
    }
  }, [formData.title, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = isNew
        ? `/api/websites/${websiteId}/pages`
        : `/api/websites/${websiteId}/pages/${page!.id}`;

      const method = isNew ? "post" : "patch";

      const data = (await api[method](url, { ...formData, websiteId })) as Page;

      // Ideally backend returns the full object, if not we merge
      const resultPage = isNew
        ? data
        : { ...page, ...formData, updated_at: new Date().toISOString() };
      onSuccess(resultPage, isNew);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            {isNew
              ? t("websites_page.pages.modal.create_title")
              : t("websites_page.pages.modal.edit_title")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icon icon="mingcute:close-line" width={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="page-form" onSubmit={handleSubmit} className="space-y-4">
            {/* General Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("websites_page.pages.modal.field_title")}
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none text-sm"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("websites_page.pages.modal.field_url")}
                </label>
                <div className="flex items-center">
                  <span className="text-gray-400 text-sm mr-1">/</span>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none text-sm font-mono"
                    value={formData.path}
                    onChange={(e) =>
                      setFormData({ ...formData, path: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("websites_page.pages.modal.field_status")}
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none text-sm"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                >
                  <option value="draft">
                    {t("websites_page.pages.table.draft")}
                  </option>
                  <option value="published">
                    {t("websites_page.pages.table.active")}
                  </option>
                </select>
              </div>
            </div>

            <hr className="border-gray-100 my-2" />

            {/* SEO & Metadata */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t("websites_page.pages.modal.seo_section")}
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("websites_page.pages.modal.field_meta_desc")}
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none text-sm resize-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("websites_page.pages.modal.field_image")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none text-sm"
                    placeholder="https://..."
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                  />
                  {/* Placeholder for image picker button if implemented later */}
                  <button
                    type="button"
                    className="p-2 bg-gray-100 rounded border border-gray-200 hover:bg-gray-200"
                  >
                    <Icon icon="iconoir:image" width={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("websites_page.pages.modal.field_head")}
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none text-sm font-mono bg-gray-50"
                  placeholder="<script>...</script>"
                  value={formData.head_code}
                  onChange={(e) =>
                    setFormData({ ...formData, head_code: e.target.value })
                  }
                />
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          {!isNew ? (
            <button
              type="button"
              onClick={() => onDelete(page!.id)}
              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
            >
              <Icon icon="mingcute:delete-2-line" /> {t("common.delete")}
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              form="page-form"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Icon icon="eos-icons:loading" />}
              {isNew
                ? t("websites_page.pages.modal.create")
                : t("websites_page.pages.modal.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
