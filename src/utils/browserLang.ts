export function browserLang(acceptLanguageHeader: string | null): string {
  let userLanguage: string = "id";

  if (acceptLanguageHeader) {
    // Checks if the value is not null and not empty (TypeScript handles null)
    const preferredLanguage = acceptLanguageHeader.split(",")[0]?.trim();

    if (preferredLanguage) {
      userLanguage = preferredLanguage.split("-")[0].toLocaleLowerCase();
    }
  }
  return userLanguage;
}
