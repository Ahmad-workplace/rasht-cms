import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useApiQuery, useApiMutation } from '@/hooks';
import { getAboutUs, updateAboutUs } from '@/lib/api/endpoints/dashboard';
import { translations } from '@/lib/constants/translations';
import useToast from '@/hooks/useToast';
import { AboutUsPut, MainAppAboutUs2 } from '@/types/dashboard.type';
import { X, Upload, Image, Loader2, Globe, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import MediaPickerModal from '@/components/common/MediaPickerModal';
import { Attachment } from '@/types/api';

const AboutUsPage: React.FC = () => {
  const [aboutUsData, setAboutUsData] = useState<AboutUsPut | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'fa' | 'en'>('fa');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const toast = useToast();

  // Fetch about us data with better error handling and caching
  const { data: initialData, isLoading, error } = useApiQuery(
    'aboutUs',
    getAboutUs,
    {
      retry: 2,
      staleTime: 30000,
      cacheTime: 60000,
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'خطا در دریافت اطلاعات');
      }
    }
  );

  // Mutation for updating about us information
  const { mutate: updateAboutUsMutation, isLoading: isUpdating } = useApiMutation(
    updateAboutUs,
    {
      onSuccess: () => {
        toast.success('اطلاعات با موفقیت به‌روزرسانی شد');
        setIsEditing(false);
        setUnsavedChanges(false);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'خطا در به‌روزرسانی اطلاعات');
      },
    }
  );

  useEffect(() => {
    if (initialData) {
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

  const handleInputChange = (field: 'title' | 'description', value: string) => {
    if (!aboutUsData) return;

    const updatedData = {
      ...aboutUsData,
      translations: aboutUsData.translations.map((t) =>
        t.language_code === currentLanguage ? { ...t, [field]: value } : t
      ),
    };

    setAboutUsData(updatedData);
    setUnsavedChanges(true);
  };

  const handleAttachmentSelect = (attachments: Attachment[]) => {
    if (!aboutUsData) return;

    setAboutUsData({
      ...aboutUsData,
      attachment: attachments.map((a) => a.id),
    });
    setShowMediaPicker(false);
    setUnsavedChanges(true);
  };

  const handleRemoveAttachment = (id: string) => {
    if (!aboutUsData) return;

    setAboutUsData({
      ...aboutUsData,
      attachment: aboutUsData.attachment.filter((a) => a !== id),
    });
    setUnsavedChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aboutUsData) {
      updateAboutUsMutation(aboutUsData);
    }
  };

  const handleCancel = () => {
    if (initialData) {
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
    setIsEditing(false);
    setUnsavedChanges(false);
  };

  const getCurrentTranslation = () => {
    return aboutUsData?.translations.find((t) => t.language_code === currentLanguage);
  };

  const handleNextImage = () => {
    if (!initialData?.attachment) return;
    setCurrentImageIndex((prev) => 
      prev === initialData.attachment.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    if (!initialData?.attachment) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? initialData.attachment.length - 1 : prev - 1
    );
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
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="h-5 bg-gray-200 rounded w-28 mb-2"></div>
          <div className="flex gap-4">
            <div className="h-24 w-24 bg-gray-200 rounded"></div>
            <div className="h-24 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderImageGallery = () => {
    if (!initialData?.attachment || initialData.attachment.length === 0) return null;

    return (
      <div className="mt-8">
        <div className="relative aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={initialData.attachment[currentImageIndex].file}
            alt={`تصویر ${currentImageIndex + 1}`}
            className="w-full h-full object-contain"
          />
          
          {initialData.attachment.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {initialData.attachment.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                currentImageIndex === index ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <img
                src={image.file}
                alt={`تصویر ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {currentImageIndex === index && (
                <div className="absolute inset-0 bg-indigo-500/10" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="text-lg font-medium mb-2">خطا در دریافت اطلاعات</p>
            <p className="text-sm">
              {error?.response?.data?.message || 'متأسفانه در دریافت اطلاعات مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.'}
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">{translations.common.aboutUs}</h1>
          {!isLoading && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Edit2 className="w-4 h-4 ml-1.5" />
              {isEditing ? 'انصراف' : 'ویرایش'}
            </button>
          )}
        </div>

        {isLoading ? (
          renderSkeleton()
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    عنوان {currentLanguage === 'fa' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={getCurrentTranslation()?.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required={currentLanguage === 'fa'}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    توضیحات {currentLanguage === 'fa' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={getCurrentTranslation()?.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required={currentLanguage === 'fa'}
                  />
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تصاویر
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {aboutUsData?.attachment.map((id) => {
                      const attachment = initialData?.attachment.find(a => a.id === id);
                      return attachment ? (
                        <div key={id} className="relative aspect-square rounded-lg overflow-hidden group">
                          <img
                            src={attachment.file}
                            alt="Attachment"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(id)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : null;
                    })}
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                    >
                      <Upload size={24} className="text-gray-400" />
                      <span className="text-sm text-gray-500">افزودن تصویر</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={!unsavedChanges || isUpdating}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        در حال ذخیره...
                      </>
                    ) : (
                      'ذخیره تغییرات'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Globe size={16} />
                  <span>زبان فعلی: {currentLanguage === 'fa' ? 'فارسی' : 'English'}</span>
                  <button
                    onClick={() => setCurrentLanguage(currentLanguage === 'fa' ? 'en' : 'fa')}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    تغییر زبان
                  </button>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    {getCurrentTranslation()?.title || '---'}
                  </h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {getCurrentTranslation()?.description || '---'}
                  </p>
                </div>

                {/* Image Gallery */}
                {renderImageGallery()}
              </div>
            )}
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