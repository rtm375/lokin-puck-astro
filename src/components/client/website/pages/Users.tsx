import { useTranslation } from "react-i18next";
const Users = () => {
  const { t } = useTranslation();
  return <div>{t("websites_page.placeholders.users")}</div>;
};

export default Users;
