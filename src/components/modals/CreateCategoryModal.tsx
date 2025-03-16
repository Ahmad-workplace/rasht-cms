import React, { useState } from 'react';
import { X, Upload, Image } from 'lucide-react';
import { Attachment } from '@/types/api';
import { translations } from '@/lib/constants/translations';
import MediaPickerModal from '@/components/common/MediaPickerModal';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { translations: { name: string; language_code: string }[]; logo: string | null }) => void;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [currentLanguage, setCurrentLanguage] = useState<'fa' | 'en'>('fa');
  const [formData, setFormData] = useState<{
    translations: { name: string; language_code: string }[];
    logo: string | null;
  }>({
    translations: [
      { name: '', language_code: 'fa' },
      { name: '', language_code: 'en' }
    ],
    logo: null
  });

  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      translations: [
        { name: '', language_code: 'fa' },
        { name: '', language_code: 'en' }
      ],
      logo: null
    });
    setLogoUrl('');
  };

  const getCurrentTranslation = () => {
    return formData.translations.find(t => t.language_code === currentLanguage) || formData.translations[0];
  };

  const updateTranslation = (name: string) => {
    setFormData({
      ...formData,
      translations: formData.translations.map(t => 
        t.language_code === currentLanguage 
          ? { ...t, name }
          : t
      )
    });
  };

  const handleLogoSelect = (attachments: Attachment[]) => {
    if (attachments.length > 0) {
      setFormData({
        ...formData,
        logo: attachments[0].id
      });
      setLogoUrl(attachments[0].file);
    }
    setShowMediaPicker(false);
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
            <h3 className="text-lg font-medium text-gray-900">{translations.categories.addCategory}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Logo Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {translations.categories.logo}
              </label>
              <div className="mt-1 flex items-center space-x-4 space-x-reverse">
                {logoUrl ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <img
                      src={logoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, logo: null });
                        setLogoUrl('');
                      }}
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
                  onClick={() => setShowMediaPicker(true)}
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

            <div>
              <label htmlFor={`name-${currentLanguage}`} className="block text-sm font-medium text-gray-700">
                {translations.categories.categoryName} {currentLanguage === 'fa' && '*'}
              </label>
              <input
                type="text"
                id={`name-${currentLanguage}`}
                value={getCurrentTranslation().name}
                onChange={(e) => updateTranslation(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required={currentLanguage === 'fa'} // Only Persian name is required
              />
            </div>

            <div className="mt-6 space-x-3 space-x-reverse text-left">
              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {translations.categories.addCategory}
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

          {/* Media Picker Modal */}
          <MediaPickerModal
            isOpen={showMediaPicker}
            onClose={() => setShowMediaPicker(false)}
            value={formData.logo ? [formData.logo] : []}
            onChange={handleLogoSelect}
            multiple={false}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateCategoryModal;