import React from "react";

import { useTranslation } from "react-i18next";
const Media = () => {
  const { t } = useTranslation();
  return <div>{t("websites_page.placeholders.media")}</div>;
};

export default Media;
