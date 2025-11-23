import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Icon } from "@iconify/react";

interface Domain {
  domain: string;
  status: "pending" | "active" | "invalid";
  type: "subdomain" | "custom";
  is_primary: boolean;
}

export default function Settings() {
  const { slug } = useParams<{ slug: string }>();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Fetch Domains
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await fetch(`/api/websites/${slug}/domains`);
        if (res.ok) setDomains(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchDomains();
  }, [slug]);

  // Add Domain
  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const res = await fetch(`/api/websites/${slug}/domains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain }),
      });

      if (!res.ok) throw new Error("Failed to add domain");

      const addedDomain = await res.json();
      setDomains([...domains, addedDomain]);
      setNewDomain("");
    } catch (err) {
      alert("Error adding domain");
    } finally {
      setIsAdding(false);
    }
  };

  // Delete Domain
  const handleDelete = async (domain: string) => {
    if (!confirm(`Remove ${domain}?`)) return;
    try {
      await fetch(`/api/websites/${slug}/domains?domain=${domain}`, {
        method: "DELETE",
      });
      setDomains(domains.filter((d) => d.domain !== domain));
    } catch (err) {
      alert("Error deleting domain");
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-xl font-bold mb-6">Site Settings</h2>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Domains</h3>

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
                  <Icon icon="ph:link" className="text-gray-500" width={24} />
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
                        Default Subdomain
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {d.type === "custom" && (
                <button
                  onClick={() => handleDelete(d.domain)}
                  className="text-gray-400 hover:text-red-600 p-2"
                >
                  <Icon icon="mingcute:delete-2-line" width={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add New */}
        <form onSubmit={handleAddDomain} className="flex gap-3">
          <input
            type="text"
            placeholder="example.com"
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
            {isAdding ? "Adding..." : "Add Domain"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-500">
          <p>To connect a custom domain:</p>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Add the domain above.</li>
            <li>
              Create a CNAME record in your DNS provider pointing to{" "}
              <code>sites.lokin.cloud</code>
            </li>
            <li>Wait for verification (usually takes a few minutes).</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
