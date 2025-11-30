import { useState } from "react";

interface UploadResult {
  key: string;
  url: string;
  size: number;
  name: string;
}

interface UseFileUploadReturn {
  upload: (files: File[], websiteId: string) => Promise<UploadResult[]>;
  isUploading: boolean;
  error: string | null;
  progress: number;
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

        const res = await fetch(`/api/websites/${websiteId}/files`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await res.json();
        results.push(data);

        completed++;
        setProgress((completed / totalFiles) * 100);
      }
    } catch (err: any) {
      setError(err.message);
      // We might want to return partial results or re-throw
      // For now, just set error
    } finally {
      setIsUploading(false);
    }

    return results;
  };

  return { upload, isUploading, error, progress };
};
