import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { useClassRegistryStore } from "@/stores/useClassRegistryStore";

interface ClassImportExportProps {
  websiteId: string;
}

export function ClassImportExport({ websiteId }: ClassImportExportProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState("");
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { exportClasses, importClasses } = useClassRegistryStore();

  const handleExport = () => {
    try {
      const jsonData = exportClasses();
      
      // Create blob and download
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `style-classes-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setShowMenu(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export classes");
    }
  };

  const handleImportClick = () => {
    setShowMenu(false);
    setShowImportDialog(true);
    setImportResult(null);
    setImportData("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      alert("Please provide JSON data to import");
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      // Conflict resolution: append timestamp
      const result = await importClasses(
        websiteId,
        importData,
        (existingName, newName) => {
          // Default strategy: append timestamp
          return `${newName}_imported_${Date.now()}`;
        },
      );

      setImportResult(result);
    } catch (error) {
      console.error("Import failed:", error);
      setImportResult({
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : "Import failed"],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCloseImportDialog = () => {
    setShowImportDialog(false);
    setImportData("");
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
          title="Import/Export Classes"
        >
          <Icon icon="lucide:download" width={14} />
          <span>Import/Export</span>
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-neutral-200 z-50">
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Icon icon="lucide:download" width={16} />
                <span>Export Classes</span>
              </button>
              <button
                onClick={handleImportClick}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
              >
                <Icon icon="lucide:upload" width={16} />
                <span>Import Classes</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Import Classes</h2>

            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload JSON File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isImporting}
                />
              </div>

              {/* Or paste JSON */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Paste JSON Data
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder='{"version": "1.0", "classes": [...]}'
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  disabled={isImporting}
                />
              </div>

              {/* Import Result */}
              {importResult && (
                <div
                  className={`rounded-md p-4 ${
                    importResult.errors.length > 0
                      ? "bg-yellow-50 border border-yellow-200"
                      : "bg-green-50 border border-green-200"
                  }`}
                >
                  <h3 className="font-medium text-sm mb-2">Import Results</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Imported:</span>{" "}
                      {importResult.imported} classes
                    </p>
                    <p>
                      <span className="font-medium">Skipped:</span>{" "}
                      {importResult.skipped} classes
                    </p>
                    {importResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium text-red-700">Errors:</p>
                        <ul className="list-disc list-inside text-xs text-red-600 mt-1">
                          {importResult.errors.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> If imported classes have name
                  conflicts with existing classes, they will be automatically
                  renamed with a timestamp suffix.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseImportDialog}
                  disabled={isImporting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {importResult ? "Close" : "Cancel"}
                </button>
                {!importResult && (
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={isImporting || !importData.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isImporting ? "Importing..." : "Import Classes"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
