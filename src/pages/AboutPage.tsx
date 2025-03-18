import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useApiQuery, useApiMutation } from '@/hooks';
import { getAboutUs, updateAboutUs } from '@/lib/api/endpoints/dashboard';
import { translations } from '@/lib/constants/translations';
import useToast from '@/hooks/useToast';
import { AboutUsPut, MainAppAboutUs2, Translation1 } from '@/types/dashboard.type';
import { X, Upload, Image } from 'lucide-react';
import MediaPickerModal from '@/components/common/MediaPickerModal';
import { Attachment } from '@/types/api';
import { BASE_URL } from '@/lib/api/client';

const AboutUsPage: React.FC = () => {
  const [aboutUsData, setAboutUsData] = useState<AboutUsPut | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'fa' | 'en'>('fa');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const toast = useToast();

  const { data: initialData, isLoading, error } = useApiQuery('aboutUs', getAboutUs);

  const updateAboutUsMutation = useApiMutation(updateAboutUs, {
    onSuccess: () => {
      toast.success('About Us information updated successfully');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update About Us information');
    },
  });

  useEffect(() => {
    if (initialData) {
      // Transform MainAppAboutUs2 to AboutUsPut
      const transformedData: AboutUsPut = {
        translations: [
          {
            title: initialData.translations.title,
            description: initialData.translations.description,
            language_code: initialData.translations.language_code,
          },
        ],
        attachment: initialData.attachment.map((a: Attachment) => a.id),
      };
      setAboutUsData(transformedData);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAboutUsData((prevData) => ({
      ...prevData!,
      translations: prevData!.translations.map((t) =>
        t.language_code === currentLanguage ? { ...t, [name]: value } : t
      ),
    }));
  };

  const handleAttachmentSelect = (attachments: Attachment[]) => {
    setAboutUsData((prevData) => ({
      ...prevData!,
      attachment: attachments.map((a) => a.id),
    }));
    setShowMediaPicker(false);
  };

  const handleRemoveAttachment = (id: string) => {
    setAboutUsData((prevData) => ({
      ...prevData!,
      attachment: prevData!.attachment.filter((a) => a !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aboutUsData) {
      try {
        await updateAboutUsMutation.mutateAsync(aboutUsData);
      } catch (error) {
        console.error('Failed to update About Us:', error);
      }
    }
  };

  const getCurrentTranslation = () => {
    return aboutUsData?.translations.find((t) => t.language_code === currentLanguage);
  };

  const getAttachmentUrl = (id: string) => {
    const attachment = initialData?.attachment.find((a) => a.id === id);
    return attachment?.file || '';
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-500">{translations.common.loading}</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-red-500">{translations.common.error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">{translations.common.aboutUs}</h1>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Language Toggle */}
            <div className="flex space-x-4 space-x-reverse border-b">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  currentLanguage === 'fa'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setCurrentLanguage('fa')}
              >
                فارسی
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  currentLanguage === 'en'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setCurrentLanguage('en')}
              >
                English
              </button>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={getCurrentTranslation()?.title || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={getCurrentTranslation()?.description || ''}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Attachments
              </label>
              <div className="mt-1 flex flex-wrap gap-2">
                {aboutUsData?.attachment.map((id) => {
                  const attachmentUrl = getAttachmentUrl(id);
                  return (
                    <div key={id} className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <img
                        src={BASE_URL+ attachmentUrl}
                        alt="Attachment"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(id)}
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Upload size={16} className="ml-2" />
                  {translations.mediaLibrary.selectImage}
                </button>
              </div>
            </div>

            {/* Save and Cancel Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {getCurrentTranslation()?.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 whitespace-pre-line">
                  {getCurrentTranslation()?.description}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit
              </button>
            </div>
          </div>
        )}

        {/* Media Picker Modal */}
        <MediaPickerModal
          isOpen={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          value={aboutUsData?.attachment || []}
          onChange={handleAttachmentSelect}
          multiple={true}
        />
      </div>
    </MainLayout>
  );
};

export default AboutUsPage;