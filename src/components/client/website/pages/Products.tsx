import React from "react";

import { useTranslation } from "react-i18next";
const Products = () => {
  const { t } = useTranslation();
  return <div>{t("websites_page.placeholders.products")}</div>;
};

export default Products;
