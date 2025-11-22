import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { format } from "date-fns";

interface Page {
  id: string;
  title: string;
  path: string;
  status: "draft" | "published";
  updated_at: string;
  image_url?: string;
  description?: string;
  head_code?: string;
}

export default function Pages() {
  const { slug: websiteSlug } = useParams<{ slug: string }>();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  const fetchPages = async () => {
    try {
      const res = await fetch(`/api/websites/${websiteSlug}/pages`);
      const data = await res.json();
      if (res.ok) setPages(data);
    } catch (error) {
      console.error("Failed to fetch pages", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (websiteSlug) fetchPages();
  }, [websiteSlug]);

  // --- Actions ---
  const handleDelete = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const res = await fetch(`/api/websites/${websiteSlug}/pages/${pageId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPages((prev) => prev.filter((p) => p.id !== pageId));
        if (editingPage?.id === pageId) setIsModalOpen(false);
      }
    } catch (error) {
      alert("Failed to delete page");
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
        <h2 className="text-xl font-bold text-gray-800">Pages</h2>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:opacity-90 transition"
        >
          <Icon icon="mingcute:add-fill" width={18} />
          Add New
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Preview
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                Last Edited
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Actions
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
                  Loading pages...
                </td>
              </tr>
            ) : pages.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No pages found. Create your first page!
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
                        to={`/admin/websites/${websiteSlug}/pages/${page.path}/editor`}
                        className="text-sm font-medium text-gray-900 hover:text-primary hover:underline"
                      >
                        {page.title || "Untitled Page"}
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
                      {page.status === "published" ? "Active" : "Draft"}
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
                        to={`/admin/websites/${websiteSlug}/pages/${page.path}/editor`}
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

      {/* Settings/Create Modal */}
      {isModalOpen && (
        <PageSettingsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          page={editingPage}
          websiteSlug={websiteSlug!}
          onSuccess={(updatedPage, isNew) => {
            if (isNew) {
              setPages([updatedPage, ...pages]);
            } else {
              setPages(
                pages.map((p) => (p.id === updatedPage.id ? updatedPage : p)),
              );
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
  websiteSlug: string;
  onSuccess: (page: Page, isNew: boolean) => void;
  onDelete: (id: string) => void;
}

const PageSettingsModal = ({
  isOpen,
  onClose,
  page,
  websiteSlug,
  onSuccess,
  onDelete,
}: PageSettingsProps) => {
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

  // Auto-generate slug from title for new pages
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
        ? `/api/websites/${websiteSlug}/pages`
        : `/api/websites/${websiteSlug}/pages/${page!.id}`;

      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

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
            {isNew ? "Create Page" : "Page Settings"}
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
                  Page Title
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
                  Slug (URL)
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
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none text-sm"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Active (Published)</option>
                </select>
              </div>
            </div>

            <hr className="border-gray-100 my-2" />

            {/* SEO & Metadata */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                SEO & Metadata
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
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
                  Featured Image URL
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
                  Custom Head Code
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
              <Icon icon="mingcute:delete-2-line" /> Delete
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
              Cancel
            </button>
            <button
              type="submit"
              form="page-form"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Icon icon="eos-icons:loading" />}
              {isNew ? "Create Page" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
