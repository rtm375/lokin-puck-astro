import React, { useState } from 'react';
import { useTranslation } from '../../i18n/client'; // Import the hook

interface Profile {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  preferences: {
    theme?: string;
    language?: string;
    [key: string]: any;
  } | null;
  email?: string;
}

interface UserSettingsProps {
  initialProfile: Profile;
  currentLang?: string; // Add this prop
}

export default function UserSettings({ initialProfile, currentLang = 'en' }: UserSettingsProps) {
  // Pass the language to the hook for immediate synchronous translation
  const { t, loaded } = useTranslation(currentLang);
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    full_name: initialProfile.full_name || '',
    bio: initialProfile.bio || '',
    theme: initialProfile.preferences?.theme || 'system',
    language: initialProfile.preferences?.language || 'en',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || t('user_profile.error_message'));

      setMessage({ type: 'success', text: t('user_profile.success_message') });
      
      if (formData.language !== initialProfile.preferences?.language) {
         window.location.reload();
      }

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
      window.location.reload()
    }
  };

  // Now this will render immediately on server (loaded=true)
  if (!loaded) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="w-full flex justify-start mx-auto py-10">

      <div className="w-xl max-w-full bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-6 sm:p-8">
            <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-6">

              <div className="col-span-full">
                <h3 className="text-base font-semibold leading-7 text-gray-900">{t('user_profile.profile_title')}</h3>
              </div>

              {/* Full Name */}
              <div className="sm:col-span-full">
                <label htmlFor="full_name">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200"> {t('user_profile.full_name')} </span>
                  <input className="mt-0.5 py-1.5 px-3 w-full rounded border-gray-300 shadow-sm sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    type="text"
                    name="full_name"
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </label>
              </div>

              {/* Bio */}
              <div className="col-span-full">
                <label htmlFor="bio">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200"> {t('user_profile.bio')} </span>
                  <textarea className="mt-0.5 py-1.5 px-3 w-full rounded border-gray-300 shadow-sm sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </label>
                <p className="mt-3 text-sm leading-6 text-gray-600">{t('user_profile.bio_hint')}</p>
              </div>

              <div className="col-span-full border-t border-gray-900/10 pt-4">
                <h3 className="text-base font-semibold leading-7 text-gray-900">{t('user_profile.section_preferences')}</h3>
              </div>

              {/* Theme */}
              <div className="sm:col-span-3">
                <label htmlFor="theme">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200"> {t('user_profile.theme')} </span>
                  <select
                    id="theme"
                    name="theme"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="mt-0.5 py-1.5 px-3 w-full rounded border-gray-300 shadow-sm sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="system">{t('user_profile.theme_system')}</option>
                    <option value="light">{t('user_profile.theme_light')}</option>
                    <option value="dark">{t('user_profile.theme_dark')}</option>
                  </select>
                </label>
              </div>

              {/* Language */}
              <div className="sm:col-span-3">
                <label htmlFor="language">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200"> {t('user_profile.language')} </span>
                  <select
                    id="language"
                    name="language"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="mt-0.5 py-1.5 px-3 w-full rounded border-gray-300 shadow-sm sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="id">Indonesia</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-start gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8 bg-gray-50 rounded-b-xl">
             {message && (
                <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {message.text}
                </p>
              )}
            <button type="submit" disabled={isLoading} className="cursor-pointer rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50">
              {isLoading ? t('common.saving') : t('common.save')}
            </button>
            <button type="button" className="cursor-pointer text-sm font-semibold leading-6 text-gray-900" onClick={() => window.location.href = '/admin/dashboard'}>
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}