/**
 * Common custom hooks
 * Reusable React hooks for common patterns
 */

import { useState } from "react";
import { api } from "@/lib/client";
import type { UploadResult } from "@/types";

interface UseFileUploadReturn {
  upload: (files: File[], websiteId: string) => Promise<UploadResult[]>;
  isUploading: boolean;
  error: string | null;
  progress: number;
}

/**
 * Hook for managing selection state (checkboxes, etc.)
 * @param items - Array of items with id property
 * @returns Selection state and handlers
 */
export function useSelection<T extends { id: number | string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(
    new Set(),
  );

  const selectAll = () => {
    const allIds = items.map((item) => item.id);
    setSelectedIds(new Set(allIds));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const toggleAll = () => {
    if (selectedIds.size === items.length) {
      deselectAll();
    } else {
      selectAll();
    }
  };

  const toggleOne = (id: number | string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const isSelected = (id: number | string) => selectedIds.has(id);

  const isAllSelected = items.length > 0 && selectedIds.size === items.length;

  const selectedCount = selectedIds.size;

  return {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    selectAll,
    deselectAll,
    toggleAll,
    toggleOne,
    setSelectedIds,
  };
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const upload = async (
    files: File[],
    websiteId: string,
  ): Promise<UploadResult[]> => {
    setIsUploading(true);
    setError(null);
    setProgress(0);
    const results: UploadResult[] = [];

    try {
      const totalFiles = files.length;
      let completed = 0;

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const data = await api.uploadFile<UploadResult>(
          `/api/websites/${websiteId}/files`,
          formData,
        );

        results.push(data);

        completed++;
        setProgress((completed / totalFiles) * 100);
      }
    } catch (err: any) {
      setError(err.message);
      // Return partial results if some files uploaded successfully
    } finally {
      setIsUploading(false);
    }

    return results;
  };

  return { upload, isUploading, error, progress };
};
