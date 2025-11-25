import React from "react";

import { useTranslation } from "react-i18next";
const Appearance = () => {
  const { t } = useTranslation();
  return <div>{t("websites_page.placeholders.appearance")}</div>;
};

export default Appearance;
