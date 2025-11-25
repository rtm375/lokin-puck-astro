import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/react"; // Initialize i18next for React
import { useProfileStore } from "@/stores/useProfileStore";

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { i18n } = useTranslation();
  const { profile } = useProfileStore();

  useEffect(() => {
    if (
      profile?.preferences?.language &&
      i18n.language !== profile.preferences.language
    ) {
      i18n.changeLanguage(profile.preferences.language);
    }
  }, [profile?.preferences?.language, i18n]);

  return <>{children}</>;
};
