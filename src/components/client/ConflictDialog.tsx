import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";

interface ConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReload: () => void;
  onOverwrite: () => void;
  serverUpdatedAt?: string;
}

export function ConflictDialog({
  isOpen,
  onClose,
  onReload,
  onOverwrite,
  serverUpdatedAt,
}: ConflictDialogProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <Icon icon="solar:danger-triangle-bold" width={24} />
            <h3 className="text-lg font-semibold">
              {t("common.conflict_detected", "Sync Conflict")}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon icon="mingcute:close-line" width={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            {t(
              "common.conflict_message",
              "This data was modified on another device or tab since you started editing."
            )}
          </p>
          {serverUpdatedAt && (
            <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-2 rounded border">
              {t("common.server_last_edited", "Server last edited at")}:{" "}
              {new Date(serverUpdatedAt).toLocaleString()}
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={onReload}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-md hover:opacity-90 transition"
            >
              <Icon icon="solar:refresh-linear" width={18} />
              {t("common.reload_from_server", "Reload from Server")}
            </button>
            <button
              onClick={onOverwrite}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 font-medium rounded-md hover:bg-red-50 transition"
            >
              <Icon icon="solar:upload-linear" width={18} />
              {t("common.overwrite_server", "Overwrite Server Data")}
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            {t("common.cancel", "Cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
