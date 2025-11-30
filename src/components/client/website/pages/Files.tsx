import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { useWebsitesStore } from "@/stores/useWebsitesStore";
import { useFileUpload } from "@/hooks/useFileUpload";

interface FileItem {
  key: string;
  url: string;
  size: number;
  lastModified: string;
  name: string;
}

export default function Files() {
  const { t } = useTranslation();
  const { subdomain: websiteSubdomain } = useParams<{ subdomain: string }>();
  const { websites } = useWebsitesStore();
  const currentWebsite = websites.find((w) => w.subdomain === websiteSubdomain);
  const websiteId = currentWebsite?.id;

  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageUsed, setStorageUsed] = useState(0);
  const { upload, isUploading, error: uploadError, progress } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_STORAGE = 50 * 1024 * 1024; // 50MB for Free tier (Hardcoded for now, ideally from profile)

  const fetchFiles = async () => {
    if (!websiteId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/websites/${websiteId}/files`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
        const totalSize = data.reduce(
          (acc: number, f: FileItem) => acc + f.size,
          0,
        );
        setStorageUsed(totalSize);
      }
    } catch (error) {
      console.error("Failed to fetch files", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [websiteId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && websiteId) {
      const selectedFiles = Array.from(e.target.files);
      const results = await upload(selectedFiles, websiteId);
      if (results.length > 0) {
        fetchFiles(); // Refresh list
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(t("common.confirm_delete"))) return; // Use generic or specific translation
    if (!websiteId) return;

    // Extract filename from key if needed, but API expects the key part after websiteId?
    // Our API route is `[websiteId]/files/[key]`.
    // The key in `files` state is `websiteId/uuid-filename`.
    // We need to pass just `uuid-filename` to the API if the API route is `[key]`.
    // Let's check the API implementation again.
    // API: `const fullKey = \`\${websiteId}/\${key}\`;`
    // So we should pass the part AFTER `${websiteId}/`.

    const filenameKey = key.split("/").pop(); // Simple extraction

    try {
      const res = await fetch(
        `/api/websites/${websiteId}/files/${filenameKey}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.key !== key));
        // Update storage locally to avoid full refetch if possible, or just refetch
        const file = files.find((f) => f.key === key);
        if (file) setStorageUsed((prev) => Math.max(0, prev - file.size));
      } else {
        alert("Failed to delete file");
      }
    } catch (error) {
      alert("Error deleting file");
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    // Could add a toast notification here
    alert("URL copied to clipboard!");
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
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
              ? "Uploading..."
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
                  colSpan={5}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  Loading files...
                </td>
              </tr>
            ) : files.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  No files uploaded yet.
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr
                  key={file.key}
                  className="hover:bg-gray-50 group transition"
                >
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
                    {file.lastModified
                      ? format(new Date(file.lastModified), "MMM d, yyyy HH:mm")
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
                        onClick={() => handleDelete(file.key)}
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
    </div>
  );
}
