import { useTranslation } from "react-i18next";

export default function LoadingState() {
  const { t } = useTranslation();

  return (
    <div className="p-10 text-center">
      {t("websites_page.editor.loading")}
    </div>
  );
}
