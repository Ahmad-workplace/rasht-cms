import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useApiQuery, useApiMutation } from '@/hooks';
import { retrieveContactUs, updateContactUs } from '@/lib/api/endpoints/dashboard';
import useToast from '@/hooks/useToast';
import { ContactUs } from '@/types/dashboard.type';
import { Loader2, Plus, X } from 'lucide-react';

const SOCIAL_MEDIA_PLATFORMS = [
  'Instagram',
  'Twitter',
  'Facebook',
  'LinkedIn',
  'YouTube',
  'Telegram',
  'WhatsApp',
  'TikTok',
  'Pinterest',
  'Snapchat',
  'Other'
];

const ContactPage: React.FC = () => {
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [number, setNumber] = useState('');
  const [social_media, setSocialMedia] = useState<Record<string, string>>({});
  const [website, setWebsite] = useState('');
  const [isAddingSocialMedia, setIsAddingSocialMedia] = useState(false);
  const [newPlatform, setNewPlatform] = useState('');
  const [customPlatform, setCustomPlatform] = useState('');

  // Fetch contact information with better error handling
  const { data: contactData, isLoading, isError, error } = useApiQuery(
    ['retrieveContactUs'],
    () => retrieveContactUs(),
    {
      retry: 2,
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'خطا در دریافت اطلاعات تماس');
      }
    }
  );

  // Mutation for updating contact information
  const { mutate: updateContact, isLoading: isUpdating } = useApiMutation(
    (data: ContactUs) => updateContactUs(data),
    {
      onSuccess: () => {
        toast.success('اطلاعات تماس با موفقیت به‌روزرسانی شد');
        setIsEditing(false);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'خطا در به‌روزرسانی اطلاعات تماس');
      },
    }
  );

  useEffect(() => {
    if (contactData) {
      setNumber(contactData.number);
      setSocialMedia(contactData.social_media || {});
      setWebsite(contactData.website);
    }
  }, [contactData]);

  const handleSave = () => {
    const updatedData: ContactUs = {
      number,
      social_media,
      website,
    };
    updateContact(updatedData);
  };

  const handleSocialMediaChange = (platform: string, url: string) => {
    setSocialMedia((prev) => ({
      ...prev,
      [platform]: url,
    }));
  };

  const handleAddSocialMedia = () => {
    const platform = newPlatform === 'Other' ? customPlatform : newPlatform;
    if (platform && !social_media[platform]) {
      setSocialMedia((prev) => ({
        ...prev,
        [platform]: '',
      }));
      setNewPlatform('');
      setCustomPlatform('');
      setIsAddingSocialMedia(false);
    }
  };

  const handleRemoveSocialMedia = (platform: string) => {
    setSocialMedia((prev) => {
      const updatedSocialMedia = { ...prev };
      delete updatedSocialMedia[platform];
      return updatedSocialMedia;
    });
  };

  const renderSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
      <div className="space-y-4">
        <div>
          <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div>
          <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  if (isError) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="text-lg font-medium mb-2">خطا در دریافت اطلاعات</p>
            <p className="text-sm">
              {error?.response?.data?.message || 'متأسفانه در دریافت اطلاعات تماس مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-sm transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">اطلاعات تماس</h1>

        {isLoading ? (
          renderSkeleton()
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">اطلاعات پایه</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  {isEditing ? 'انصراف' : 'ویرایش'}
                </button>
              </div>

              <div className="space-y-4">
                {/* Number Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">شماره تماس:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="شماره تماس را وارد کنید"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{number || '---'}</p>
                  )}
                </div>

                {/* Social Media Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">شبکه‌های اجتماعی:</label>
                  <div className="space-y-2">
                    {Object.entries(social_media).map(([platform, url]) => (
                      <div key={platform} className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={platform}
                              disabled
                              className="w-1/3 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                            />
                            <input
                              type="text"
                              value={url}
                              onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="آدرس را وارد کنید"
                            />
                            <button
                              onClick={() => handleRemoveSocialMedia(platform)}
                              className="p-2 text-red-600 hover:text-red-800 rounded-md hover:bg-red-50"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <div className="flex-1 py-2">
                            <span className="font-medium">{platform}: </span>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                              {url}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <div>
                        {isAddingSocialMedia ? (
                          <div className="border rounded-lg p-4 space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                انتخاب پلتفرم:
                              </label>
                              <select
                                value={newPlatform}
                                onChange={(e) => setNewPlatform(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                <option value="">انتخاب کنید</option>
                                {SOCIAL_MEDIA_PLATFORMS.map(platform => (
                                  <option 
                                    key={platform} 
                                    value={platform}
                                    disabled={social_media[platform] !== undefined && platform !== 'Other'}
                                  >
                                    {platform}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {newPlatform === 'Other' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  نام پلتفرم:
                                </label>
                                <input
                                  type="text"
                                  value={customPlatform}
                                  onChange={(e) => setCustomPlatform(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                  placeholder="نام پلتفرم را وارد کنید"
                                />
                              </div>
                            )}

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingSocialMedia(false);
                                  setNewPlatform('');
                                  setCustomPlatform('');
                                }}
                                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                              >
                                انصراف
                              </button>
                              <button
                                type="button"
                                onClick={handleAddSocialMedia}
                                disabled={!newPlatform || (newPlatform === 'Other' && !customPlatform)}
                                className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                افزودن
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsAddingSocialMedia(true)}
                            className="flex items-center gap-1 w-full mt-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Plus size={16} />
                            افزودن شبکه اجتماعی
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Website Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">وب‌سایت:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="آدرس وب‌سایت را وارد کنید"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">
                      {website ? (
                        <a href={website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                          {website}
                        </a>
                      ) : (
                        '---'
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        در حال ذخیره...
                      </>
                    ) : (
                      'ذخیره تغییرات'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ContactPage;