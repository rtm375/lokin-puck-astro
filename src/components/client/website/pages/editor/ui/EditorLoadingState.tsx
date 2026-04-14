import { useTranslation } from "react-i18next";

interface EditorLoadingStateProps {
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  onBackClick: () => void;
}

export const EditorLoadingState = ({
  isLoading,
  hasError,
  errorMessage,
  onBackClick,
}: EditorLoadingStateProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="p-10 text-center">
        {t("websites_page.editor.loading")}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
        <div className="text-red-600 mb-4">{errorMessage}</div>
        <button
          onClick={onBackClick}
          className="cursor-pointer text-sm text-primary hover:underline"
        >
          ← {t("websites_page.editor.back_to_dashboard")}
        </button>
      </div>
    );
  }

  return null;
};
