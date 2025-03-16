import React, { useState } from 'react';
import { X, Upload, Image } from 'lucide-react';
import { Company, Attachment } from '@/types/api';
import { translations } from '@/lib/constants/translations';
import MediaPickerModal from '@/components/common/MediaPickerModal';

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Company, 'id'>) => void;
}

interface CompanyTranslation {
  name: string;
  description: string;
  specliaities?: string;
  language_code: string;
  info?: Record<string, any>;
}

const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    logo: '',
    logoUrl: '',
    attachment: [] as string[],
    attachmentUrls: [] as string[],
    tags: [] as number[],
    translations: [
      {
        language_code: 'fa',
        name: '',
        description: '',
        specliaities: '',
        info: {}
      },
      {
        language_code: 'en',
        name: '',
        description: '',
        specliaities: '',
        info: {}
      }
    ]
  });

  const [currentLanguage, setCurrentLanguage] = useState<'fa' | 'en'>('fa');
  const [showLogoMediaPicker, setShowLogoMediaPicker] = useState(false);
  const [showAttachmentsMediaPicker, setShowAttachmentsMediaPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.logo) {
      alert('لطفاً لوگو را انتخاب کنید');
      return;
    }

    if (!formData.attachment.length) {
      alert('لطفاً حداقل یک تصویر انتخاب کنید');
      return;
    }

    const currentTranslation = formData.translations.find(t => t.language_code === 'fa');
    if (!currentTranslation?.name || !currentTranslation?.description) {
      alert('لطفاً نام و توضیحات فارسی را وارد کنید');
      return;
    }

    // Submit only the IDs and required data
    const submitData = {
      logo: formData.logo,
      attachment: formData.attachment,
      tags: formData.tags,
      translations: formData.translations
    };

    onSubmit(submitData);
    setFormData({
      logo: '',
      logoUrl: '',
      attachment: [],
      attachmentUrls: [],
      tags: [],
      translations: [
        {
          language_code: 'fa',
          name: '',
          description: '',
          specliaities: '',
          info: {}
        },
        {
          language_code: 'en',
          name: '',
          description: '',
          specliaities: '',
          info: {}
        }
      ]
    });
  };

  const getCurrentTranslation = () => {
    return formData.translations.find(t => t.language_code === currentLanguage) || formData.translations[0];
  };

  const handleLogoSelect = (attachments: Attachment[]) => {
    if (attachments.length > 0) {
      setFormData({
        ...formData,
        logo: attachments[0].id,
        logoUrl: attachments[0].file
      });
    }
    setShowLogoMediaPicker(false);
  };

  const handleAttachmentsSelect = (attachments: Attachment[]) => {
    setFormData({
      ...formData,
      attachment: attachments.map(a => a.id),
      attachmentUrls: attachments.map(a => a.file)
    });
    setShowAttachmentsMediaPicker(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl px-4 pt-5 pb-4 overflow-hidden text-right align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={20} />
            </button>
            <h3 className="text-lg font-medium text-gray-900">{translations.companies.addCompany}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Logo Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {translations.companies.logo} *
              </label>
              <div className="mt-1 flex items-center space-x-4 space-x-reverse">
                {formData.logoUrl ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <img
                      src={formData.logoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: '', logoUrl: '' })}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowLogoMediaPicker(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Upload size={16} className="ml-2" />
                  {translations.mediaLibrary.selectImage}
                </button>
              </div>
            </div>

            {/* Attachments Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translations.mediaLibrary.title} *
              </label>
              
              <div className="mt-1 flex items-center space-x-4 space-x-reverse">
                <div className="flex flex-wrap gap-4">
                  {formData.attachmentUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          attachment: formData.attachment.filter((_, i) => i !== index),
                          attachmentUrls: formData.attachmentUrls.filter((_, i) => i !== index)
                        })}
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {formData.attachmentUrls.length === 0 && (
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAttachmentsMediaPicker(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Upload size={16} className="ml-2" />
                  {translations.mediaLibrary.selectImage}
                </button>
              </div>
            </div>

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

            {/* Translation Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor={`name-${currentLanguage}`} className="block text-sm font-medium text-gray-700">
                  {translations.companies.companyName} {currentLanguage === 'fa' && '*'}
                </label>
                <input
                  type="text"
                  id={`name-${currentLanguage}`}
                  value={getCurrentTranslation().name}
                  onChange={(e) => setFormData({
                    ...formData,
                    translations: formData.translations.map(t => 
                      t.language_code === currentLanguage 
                        ? { ...t, name: e.target.value }
                        : t
                    )
                  })}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required={currentLanguage === 'fa'}
                />
              </div>

              <div>
                <label htmlFor={`description-${currentLanguage}`} className="block text-sm font-medium text-gray-700">
                  {translations.companies.description} {currentLanguage === 'fa' && '*'}
                </label>
                <textarea
                  id={`description-${currentLanguage}`}
                  value={getCurrentTranslation().description}
                  onChange={(e) => setFormData({
                    ...formData,
                    translations: formData.translations.map(t => 
                      t.language_code === currentLanguage 
                        ? { ...t, description: e.target.value }
                        : t
                    )
                  })}
                  rows={3}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required={currentLanguage === 'fa'}
                />
              </div>

              <div>
                <label htmlFor={`specialties-${currentLanguage}`} className="block text-sm font-medium text-gray-700">
                  {translations.companies.specialties}
                </label>
                <input
                  type="text"
                  id={`specialties-${currentLanguage}`}
                  value={getCurrentTranslation().specliaities || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    translations: formData.translations.map(t => 
                      t.language_code === currentLanguage 
                        ? { ...t, specliaities: e.target.value }
                        : t
                    )
                  })}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder={translations.companies.specialtiesPlaceholder}
                />
              </div>
            </div>

            <div className="mt-6 space-x-3 space-x-reverse text-left">
              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {translations.companies.addCompany}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {translations.common.cancel}
              </button>
            </div>
          </form>

          {/* Media Picker Modals */}
          <MediaPickerModal
            isOpen={showLogoMediaPicker}
            onClose={() => setShowLogoMediaPicker(false)}
            value={formData.logo ? [formData.logo] : []}
            onChange={handleLogoSelect}
            multiple={false}
          />

          <MediaPickerModal
            isOpen={showAttachmentsMediaPicker}
            onClose={() => setShowAttachmentsMediaPicker(false)}
            value={formData.attachment}
            onChange={handleAttachmentsSelect}
            multiple={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateCompanyModal;