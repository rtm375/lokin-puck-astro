import { use } from "react";

export function isActive(currentPath: string, target: string) {
  return currentPath === target || currentPath.startsWith(target + "/");
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export function browserLang(acceptLanguageHeader: string | null): string {
  let userLanguage: string = "id";

  if (acceptLanguageHeader) { // Checks if the value is not null and not empty (TypeScript handles null)
    const preferredLanguage = acceptLanguageHeader.split(",")[0]?.trim();

    if (preferredLanguage) {
      userLanguage = preferredLanguage.split("-")[0].toLocaleLowerCase();
    }
  }
  return userLanguage;
}