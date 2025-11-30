import React from "react";

import { useTranslation } from "react-i18next";
const Files = () => {
  const { t } = useTranslation();
  return <div>{t("websites_page.placeholders.files")}</div>;
};

export default Files;
