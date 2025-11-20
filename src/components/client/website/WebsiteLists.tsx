import React, { useState } from 'react';
import { useTranslation } from '../../../i18n/client'; // Import the hook

export enum Status {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE',
}

interface Website {
  id: string;
  name: string;
  description: string | null;
  status: Status,
  created_at: string;
}

interface WebsitesListProps {
  initialWebsites: Website[];
  tier: string;
  currentLang?: string; // Add this prop
}


export default function WebsitesList({ initialWebsites, tier, currentLang = 'en' }: WebsitesListProps) {
  const [websites, setWebsites] = useState<Website[]>(initialWebsites);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t, loaded } = useTranslation(currentLang);
  // Form State
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create website');
      setWebsites([data, ...websites]);
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Website Cards */}
        {websites.map((site) => (
          <div key={site.id} className="block group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200">
            <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100">
              {/* Placeholder Image - you can replace with a screenshot service later */}
              <div className="flex h-full text-gray-400">
                <img src="https://picsum.photos/400/300" className="w-full h-full object-cover" />
              </div>

              {/* Overlay Actions */}
              <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-black/10 transition-opacity flex items-center justify-center">
                <div className="inline-flex shadow-sm rounded-md">
                  <a
                    href={`/admin/websites/${site.id}/editor`}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {t('websites_page.actions.open')}
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 truncate">{site.name || 'Untitled'}</h3>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${site.status === 'ONLINE' && 'bg-green-500'} ${site.status === 'OFFLINE' && 'bg-red-500'} ${site.status === 'MAINTENANCE' && 'bg-yellow-500'}`}>
                  {site.status}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* "New Website" Button Card */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center justify-center h-full rounded-lg border-2 border-dashed border-gray-300 p-12 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="mt-2 block text-sm font-medium text-gray-900">{t('websites_page.create_new')}</span>
        </button>
      </div>

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">{t('websites_page.modal_title')}</h2>
            {tier == 'free' && websites.length > 0 && (
              <div className="text-sm rounded-md mb-4 p-2 border border-primary/40 bg-primary/20">
                <span dangerouslySetInnerHTML={{ 
                  __html: t('websites_page.limit_reached', { url: '/admin/billing' }) 
                }} />
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('websites_page.field_name')}</label>
                <input
                  type="text"
                  required
                  disabled={tier == 'free' && websites.length > 0}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('websites_page.field_description')} ({t('common.optional')})</label>
                <textarea
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                  value={formData.description}
                  disabled={tier == 'free' && websites.length > 0}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex justify-start gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isLoading || tier == 'free' && websites.length > 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary/80 rounded-md hover:bg-primary/80 disabled:opacity-50"
                >
                  {isLoading ? t('websites_page.actions.creating') : t('websites_page.actions.create')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}