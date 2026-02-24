import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { api } from "@/lib/client";
import { useWebsitesStore } from "@/stores/useWebsitesStore";
import { useFileUpload } from "@/utils/hooks";
import { formatBytes } from "@/utils/formatters";
import type { FileItem } from "@/types";

export default function Files() {
  const { t } = useTranslation();
  const { subdomain: websiteSubdomain } = useParams<{ subdomain: string }>();
  const { websites } = useWebsitesStore();
  const currentWebsite = websites.find((w) => w.subdomain === websiteSubdomain);
  const websiteId = currentWebsite?.id;

  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageUsed, setStorageUsed] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const { upload, isUploading, error: uploadError, progress } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_STORAGE = 50 * 1024 * 1024; // 50MB for Free tier (Hardcoded for now, ideally from profile)
  const ITEMS_PER_PAGE = 20;

  const fetchFiles = async (page: number = 1) => {
    if (!websiteId) return;
    setIsLoading(true);
    try {
      const data = await api.get<any>(
        `/api/websites/${websiteId}/files?page=${page}&limit=${ITEMS_PER_PAGE}`,
      );

      setFiles(data.files || []);
      setTotal(data.total || 0);
      setCurrentPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setSelectedFiles(new Set()); // Reset selection on page change

      // Use total storage from API (calculated from all files, not just current page)
      setStorageUsed(data.totalStorage || 0);
    } catch (error) {
      console.error("Failed to fetch files", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPage);
  }, [websiteId, currentPage]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && websiteId) {
      const selectedFiles = Array.from(e.target.files);
      const results = await upload(selectedFiles, websiteId);
      if (results.length > 0) {
        fetchFiles(currentPage); // Refresh current page
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("common.confirm_delete"))) return;
    if (!websiteId) return;

    try {
      const fileToDelete = files.find((f) => f.id === id);
      if (!fileToDelete) {
        alert("File not found.");
        return;
      }

      await api.delete(`/api/websites/${websiteId}/files/${fileToDelete.id}`);

      // Update local state
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setStorageUsed((prev) => Math.max(0, prev - fileToDelete.size));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (error) {
      alert("Error deleting file");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = files.map((f) => f.id);
      setSelectedFiles(new Set(allIds));
    } else {
      setSelectedFiles(new Set());
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedFiles(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (
      !confirm(
        t("websites_page.files.confirm_bulk_delete", {
          count: selectedFiles.size,
          defaultValue: `Are you sure you want to delete ${selectedFiles.size} files?`,
        }),
      )
    )
      return;

    if (!websiteId) return;

    try {
      await api.delete(`/api/websites/${websiteId}/files`, {
        data: { ids: Array.from(selectedFiles) },
      });

      // Remove deleted files from local state
      setFiles((prev) => prev.filter((f) => !selectedFiles.has(f.id)));

      // Update storage locally
      const deletedFiles = files.filter((f) => selectedFiles.has(f.id));
      const deletedSize = deletedFiles.reduce((acc, f) => acc + f.size, 0);
      setStorageUsed((prev) => Math.max(0, prev - deletedSize));

      setSelectedFiles(new Set());

      // If page becomes empty, refresh or go to previous page
      if (files.length === selectedFiles.size && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else if (files.length === selectedFiles.size) {
        fetchFiles(1);
      }
    } catch (error) {
      alert("Error deleting files");
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    // Could add a toast notification here
    alert("URL copied to clipboard!");
  };

  const usagePercent = Math.min(100, (storageUsed / MAX_STORAGE) * 100);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {t("websites_page.files.title", "Files")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your website assets and media.
          </p>
        </div>
        <div className="flex gap-2">
          {selectedFiles.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-md hover:bg-red-100 transition"
            >
              <Icon icon="mingcute:delete-2-line" width={18} />
              Delete ({selectedFiles.size})
            </button>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:opacity-90 transition disabled:opacity-50"
          >
            {isUploading ? (
              <Icon icon="eos-icons:loading" width={18} />
            ) : (
              <Icon icon="mingcute:upload-2-fill" width={18} />
            )}
            {isUploading
              ? `Uploading... ${Math.round(progress)}%`
              : t("websites_page.files.upload", "Upload Files")}
          </button>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
          <span>Storage Usage</span>
          <span>
            {formatBytes(storageUsed)} / {formatBytes(MAX_STORAGE)}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full ${usagePercent > 90 ? "bg-red-500" : "bg-primary"}`}
            style={{ width: `${usagePercent}%` }}
          ></div>
        </div>
        {uploadError && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            {uploadError}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectedFiles.size > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                    checked={
                      files.length > 0 && selectedFiles.size === files.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Preview
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filename
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                Uploaded At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Loading files...
                </td>
              </tr>
            ) : files.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No files uploaded yet.
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50 group transition">
                  {/* Checkbox */}
                  {selectedFiles.size > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => handleSelectOne(file.id)}
                      />
                    </td>
                  )}

                  {/* Preview */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className="h-10 w-10 bg-gray-100 rounded overflow-hidden border border-gray-200 cursor-pointer"
                      onClick={() => window.open(file.url, "_blank")}
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </td>

                  {/* Filename */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span
                        className="text-sm font-medium text-gray-900 truncate max-w-xs"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                      <span
                        className="text-xs text-gray-400 font-mono mt-0.5 truncate max-w-xs"
                        title={file.url}
                      >
                        {file.url}
                      </span>
                    </div>
                  </td>

                  {/* Size */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatBytes(file.size)}
                  </td>

                  {/* Uploaded At */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file.created_at
                      ? format(new Date(file.created_at), "MMM d, yyyy HH:mm")
                      : "-"}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyToClipboard(file.url)}
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-md transition"
                        title="Copy URL"
                      >
                        <Icon icon="solar:copy-linear" width={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                        title="Delete"
                      >
                        <Icon icon="mingcute:delete-2-line" width={18} />
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
      {!isLoading && files.length > 0 && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {files.length} of {total} files
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
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
    </div>
  );
}
