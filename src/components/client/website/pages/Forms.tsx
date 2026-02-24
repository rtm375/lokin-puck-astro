import { useTranslation } from "react-i18next";
const Forms = () => {
  const { t } = useTranslation();
  return <div>{t("websites_page.placeholders.forms")}</div>;
};

export default Forms;
