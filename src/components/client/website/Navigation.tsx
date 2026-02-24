import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { NavLink, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/useProfileStore";
import { useWebsitesStore, type Website } from "@/stores/useWebsitesStore";

interface NavWebsitesProps {
  user: any;
}

const NavWebsites = ({ user }: NavWebsitesProps) => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const { profile, fetchProfile } = useProfileStore();
  // const currentLanguage = profile?.preferences?.language || "en";
  const { t } = useTranslation();
  const { websites, fetchWebsites } = useWebsitesStore();
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null);

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
  }, [profile, fetchProfile]);

  useEffect(() => {
    if (websites.length === 0) {
      fetchWebsites();
    }
  }, [websites.length, fetchWebsites]);

  useEffect(() => {
    if (websites.length > 0 && subdomain) {
      const foundWebsite = websites.find((w) => w.subdomain === subdomain);
      setCurrentWebsite(foundWebsite || null);
    }
  }, [websites, subdomain]);

  const email = user?.email || "user@example.com";
  const fullName =
    profile?.full_name || user?.user_metadata?.full_name || email.split("@")[0];
  const avatar = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const initials = fullName ? fullName.slice(0, 2).toUpperCase() : "";

  const activeLinkClass = "bg-linear-to-r from-transparent to-gray-100";
  const inactiveLinkClass = "";

  const iconSize = 24;

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${
      isActive ? activeLinkClass : inactiveLinkClass
    } flex items-center gap-2 py-2 px-4 text-gray-800 hover:bg-linear-to-r hover:from-transparent hover:to-gray-100`;

  return (
    <div className="flex h-screen flex-col justify-between border-e border-gray-200 bg-white">
      <div className="py-4 space-y-6">
        <span className="block h-10 w-32 place-content-center py-2 px-4">
          <img
            src="/logo-light.svg"
            className="max-h-7 w-auto"
            alt="Lokin Builder"
          />
        </span>
        <ul className="space-y-1">
          <li>
            <a
              href="/admin/dashboard"
              className="flex items-center gap-2 py-2 px-4 text-gray-800 hover:bg-linear-to-r hover:from-transparent hover:to-gray-100"
            >
              <Icon
                icon="hugeicons:dashboard-square-01"
                width={iconSize}
                height={iconSize}
              />
              <span className="text-sm font-medium">
                {t("navigations.defaults.dashboard")}
              </span>
            </a>
          </li>
          <li>
            <div className="px-4 py-2 relative flex flex-col gap-2">
              <p className="text-sm"> {t("navigations.websites.editing")} </p>
              <div className="relative flex group">
                <span className="flex w-full overflow-hidden rounded group-hover:rounded-t group-hover:rounded-b-none border border-gray-300 bg-white shadow-sm dark:divide-gray-600 dark:border-gray-600 dark:bg-gray-800">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-left flex-1 text-sm font-medium transition-colors hover:bg-gray-50 hover:text-gray-900 focus:relative dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white truncate"
                  >
                    {currentWebsite?.name || "..."}
                  </button>
                  <button
                    type="button"
                    className="w-8 flex items-center justify-center text-sm font-medium transition-colors hover:bg-gray-50 hover:text-gray-900 focus:relative dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
                    aria-label="Menu"
                  >
                    <Icon
                      icon="lsicon:down-outline"
                      width={iconSize}
                      height={iconSize}
                    />
                  </button>
                </span>
                <div
                  role="menu"
                  className="absolute hidden group-hover:block start-0 top-full z-auto w-full divide-y divide-gray-200 overflow-hidden rounded-b border border-t-0 border-gray-300 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800"
                >
                  {websites.map((website) => (
                    <div key={website.id}>
                      <Link
                        to={`/admin/websites/${website.subdomain}/pages`}
                        className="block px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white truncate"
                        role="menuitem"
                      >
                        {website.name}
                      </Link>
                    </div>
                  ))}
                  <a
                    href="/admin/websites"
                    className="block w-full px-3 py-2 text-sm font-medium transition-colors hover:bg-red-50 ltr:text-left rtl:text-right"
                  >
                    {t("navigations.websites.all")}
                  </a>
                </div>
              </div>
            </div>
          </li>
          <li>
            <NavLink
              to={`/admin/websites/${subdomain}/pages`}
              className={getLinkClass}
              end
            >
              <Icon icon="iconoir:page" width={iconSize} height={iconSize} />
              <span className="text-sm font-medium">
                {" "}
                {t("navigations.websites.pages")}{" "}
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/admin/websites/${subdomain}/files`}
              className={getLinkClass}
            >
              <Icon
                icon="iconoir:media-image"
                width={iconSize}
                height={iconSize}
              />
              <span className="text-sm font-medium">
                {" "}
                {t("navigations.websites.files")}{" "}
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/admin/websites/${subdomain}/products`}
              className={getLinkClass}
            >
              <Icon
                icon="fluent-mdl2:product-release"
                width={iconSize}
                height={iconSize}
              />
              <span className="text-sm font-medium">
                {" "}
                {t("navigations.websites.products")}{" "}
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/admin/websites/${subdomain}/forms`}
              className={getLinkClass}
            >
              <Icon
                icon="fluent:form-28-regular"
                width={iconSize}
                height={iconSize}
              />
              <span className="text-sm font-medium">
                {" "}
                {t("navigations.websites.forms")}{" "}
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/admin/websites/${subdomain}/appearance`}
              className={getLinkClass}
            >
              <Icon
                icon="mdi:style-outline"
                width={iconSize}
                height={iconSize}
              />
              <span className="text-sm font-medium">
                {" "}
                {t("navigations.websites.appearance")}{" "}
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/admin/websites/${subdomain}/users`}
              className={getLinkClass}
            >
              <Icon
                icon="humbleicons:users"
                width={iconSize}
                height={iconSize}
              />
              <span className="text-sm font-medium">
                {" "}
                {t("navigations.websites.users")}{" "}
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={`/admin/websites/${subdomain}/settings`}
              className={getLinkClass}
            >
              <Icon
                icon="solar:settings-linear"
                width={iconSize}
                height={iconSize}
              />
              <span className="text-sm font-medium">
                {" "}
                {t("navigations.websites.settings")}{" "}
              </span>
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="sticky inset-x-0 bottom-0 border-t border-gray-200">
        <div className="relative w-full group">
          <div className="absolute bottom-full left-0 w-full bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden z-50 transition-all duration-200 origin-bottom opacity-0 invisible translate-y-2 pointer-events-none group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto">
            <div className="">
              <a
                href="/admin/profile"
                className="flex items-center text-sm gap-2 py-2 px-4 text-gray-800 hover:bg-linear-to-r hover:from-transparent hover:to-gray-100"
              >
                <Icon
                  icon="lucide:user-round"
                  width={iconSize}
                  height={iconSize}
                />
                {t("navigations.defaults.profile")}
              </a>

              <a
                href="/admin/billing"
                className="flex items-center text-sm gap-2 py-2 px-4 text-gray-800 hover:bg-linear-to-r hover:from-transparent hover:to-gray-100"
              >
                <Icon
                  icon="icon-park-outline:bill"
                  width={iconSize}
                  height={iconSize}
                />
                {t("navigations.defaults.billing")}
              </a>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // clear local storage
                  localStorage.clear();
                  // clear cookies
                  document.cookie.split(";").forEach((cookie) => {
                    document.cookie = cookie
                      .replace(/^ +/, "")
                      .replace(
                        /=.+$/,
                        "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/",
                      );
                  });
                  fetch("/api/auth/logout", {
                    method: "POST",
                  }).then(() => {
                    window.location.href = "/";
                  });
                }}
                method="POST"
                className="w-full border-t border-gray-200"
              >
                <button
                  type="submit"
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                >
                  <Icon
                    icon="material-symbols:logout-rounded"
                    width={iconSize}
                    height={iconSize}
                  />
                  {t("common.logout")}
                </button>
              </form>
            </div>
          </div>

          <button className="flex items-center gap-3 w-full py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors outline-none">
            <div className="h-7 w-7 shrink-0 rounded-full bg-primary/80 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {avatar ? (
                <img src={avatar} className="rounded-full" />
              ) : (
                initials
              )}
            </div>

            <div className="flex flex-col text-left overflow-hidden">
              <strong className="block text-sm font-medium text-gray-900 dark:text-white truncate">
                {fullName}
              </strong>
              <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                {email}
              </span>
            </div>

            <span className="ml-auto h-4 w-4 text-gray-400 transition-transform duration-200 group-focus-within:rotate-180">
              <Icon
                icon="lsicon:up-outline"
                width={iconSize}
                height={iconSize}
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavWebsites;
