import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { api } from "@/lib/client";
import { useWebsitesStore } from "@/stores/useWebsitesStore";
import { useDomainsStore, type Domain } from "@/stores/useDomainsStore";
import { usePagesStore } from "@/stores/usePagesStore";

export default function Settings() {
  const { t } = useTranslation();
  const { subdomain } = useParams<{ subdomain: string }>();
  const { websites } = useWebsitesStore();
  const currentWebsite = websites.find((w) => w.subdomain === subdomain);
  const websiteId = currentWebsite?.id;

  const {
    domains,
    fetchDomains,
    updateDomain,
    deleteDomain: removeDomain,
  } = useDomainsStore();
  const { pages, fetchPages } = usePagesStore();
  const [newDomain, setNewDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [frontPageId, setFrontPageId] = useState<string>("");
  const [isSavingFrontPage, setIsSavingFrontPage] = useState(false);

  // Fetch Domains and Pages
  useEffect(() => {
    if (websiteId) {
      fetchDomains(websiteId);
      fetchPages(websiteId);
    }
  }, [websiteId, fetchDomains, fetchPages]);

  // Set initial front page from pages data
  useEffect(() => {
    const currentFrontPage = pages.find((p) => p.is_front_page);
    if (currentFrontPage) {
      setFrontPageId(currentFrontPage.id);
    }
  }, [pages]);

  // Add Domain
  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const addedDomain = await api.post<Domain>(
        `/api/websites/${websiteId}/domains`,
        {
          domain: newDomain,
        },
      );

      useDomainsStore.getState().addDomain(addedDomain);
      setNewDomain("");
    } catch (err) {
      alert(t("websites_page.settings.domains.error_add"));
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerify = async (domain: string) => {
    const btn = document.getElementById(
      `verify-btn-${domain}`,
    ) as HTMLButtonElement;
    if (btn) {
      btn.disabled = true;
      btn.innerText = t("websites_page.settings.domains.verifying");
    }

    try {
      const data = await api.post<{ verified: boolean }>(
        `/api/websites/${websiteId}/domains/verify`,
        { domain },
      );

      if (data.verified) {
        // Update store
        const targetDomain = domains.find((d) => d.domain === domain);
        if (targetDomain) {
          updateDomain({ ...targetDomain, status: "active" });
        }
        alert(t("websites_page.settings.domains.success_verify"));
      } else {
        alert(t("websites_page.settings.domains.fail_verify"));
      }
    } catch (err) {
      alert(t("websites_page.settings.domains.error_verify"));
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = t("websites_page.settings.domains.verify");
      }
    }
  };

  // Delete Domain
  const handleDelete = async (domain: string) => {
    if (
      !confirm(t("websites_page.settings.domains.confirm_delete", { domain }))
    )
      return;
    try {
      await api.delete(`/api/websites/${websiteId}/domains/${domain}`);
      removeDomain(domain);
    } catch (err) {
      alert(t("websites_page.settings.domains.error_delete"));
    }
  };

  // Save Front Page
  const handleSaveFrontPage = async () => {
    setIsSavingFrontPage(true);
    try {
      await api.post(`/api/websites/${websiteId}/front-page`, {
        pageId: frontPageId || null,
      });

      // Update local pages store
      const updatedPages = pages.map((p) => ({
        ...p,
        is_front_page: p.id === frontPageId,
      }));
      usePagesStore.getState().setPages(updatedPages);

      alert(t("websites_page.settings.reading.success"));
    } catch (err) {
      alert(t("websites_page.settings.reading.error"));
    } finally {
      setIsSavingFrontPage(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-bold mb-6">
        {t("websites_page.settings.title")}
      </h2>

      <div className="flex gap-4">
        <div className="border-r border-gray-200 dark:border-gray-700">
          <div
            role="tablist"
            className="-mr-px flex flex-col gap-1 *:hover:bg-gray-200 dark:*:hover:bg-gray-800"
          >
            <button
              role="tab"
              aria-selected="true"
              className="border-r-2 border-primary px-4 py-2 text-left text-sm font-medium text-primary transition-colors hover:text-blue-700 dark:hover:text-blue-500"
            >
              {t("websites_page.settings.domains.title")}
            </button>

            <button
              role="tab"
              aria-selected="false"
              className="border-r-2 border-transparent px-4 py-2 text-left text-sm font-medium text-gray-600 transition-colors hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
            >
              Privacy
            </button>

            <button
              role="tab"
              aria-selected="false"
              className="border-r-2 border-transparent px-4 py-2 text-left text-sm font-medium text-gray-600 transition-colors hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
            >
              Security
            </button>
          </div>
        </div>

        <div role="tabpanel" className="flex-1">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">
              {t("websites_page.settings.domains.title")}
            </h3>

            {/* List */}
            <div className="space-y-4 mb-6">
              {domains.map((d) => (
                <div
                  key={d.domain}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    {d.type === "subdomain" ? (
                      <Icon
                        icon="ph:globe-simple"
                        className="text-primary"
                        width={24}
                      />
                    ) : (
                      <Icon
                        icon="ph:link"
                        className="text-gray-500"
                        width={24}
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{d.domain}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded capitalize ${
                            d.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {d.status}
                        </span>
                        {d.type === "subdomain" && (
                          <span className="text-xs text-gray-500">
                            {t(
                              "websites_page.settings.domains.default_subdomain",
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {d.type === "custom" && (
                    <div className="flex items-center gap-2">
                      {/* {d.status === "pending" && (
                        <button
                          id={`verify-btn-${d.domain}`}
                          onClick={() => handleVerify(d.domain)}
                          className="text-xs bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-50"
                        >
                          Verify
                        </button>
                      )} */}
                      <button
                        id={`verify-btn-${d.domain}`}
                        onClick={() => handleVerify(d.domain)}
                        className="text-xs bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-50"
                      >
                        {t("websites_page.settings.domains.verify")}
                      </button>
                      <button
                        onClick={() => handleDelete(d.domain)}
                        className="text-gray-400 hover:text-red-600 p-2"
                      >
                        <Icon icon="mingcute:delete-2-line" width={20} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add New */}
            <form onSubmit={handleAddDomain} className="flex gap-3">
              <input
                type="text"
                placeholder={t("websites_page.settings.domains.placeholder")}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={isAdding}
                className="px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isAdding
                  ? t("websites_page.settings.domains.adding")
                  : t("websites_page.settings.domains.add")}
              </button>
            </form>

            <div className="mt-4 text-sm text-gray-500">
              <p>{t("websites_page.settings.domains.instructions_title")}</p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>{t("websites_page.settings.domains.instruction_1")}</li>
                <li>
                  {t("websites_page.settings.domains.instruction_2")}{" "}
                  <code>sites.lokin.id</code>
                </li>
                <li>{t("websites_page.settings.domains.instruction_3")}</li>
                <li>{t("websites_page.settings.domains.instruction_4")}</li>
              </ol>
            </div>
          </div>

          {/* Reading Settings */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">
              {t("websites_page.settings.reading.title")}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("websites_page.settings.reading.front_page_label")}
                </label>
                <select
                  value={frontPageId}
                  onChange={(e) => setFrontPageId(e.target.value)}
                  className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="">
                    {t("websites_page.settings.reading.no_front_page")}
                  </option>
                  {pages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.title} ({page.path})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  {t("websites_page.settings.reading.front_page_hint")}
                </p>
              </div>

              <button
                onClick={handleSaveFrontPage}
                disabled={isSavingFrontPage}
                className="px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isSavingFrontPage ? t("common.saving") : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
