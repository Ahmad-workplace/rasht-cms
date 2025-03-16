import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TaskTranslation } from './types';
import { translations } from '@/lib/constants/translations';

interface TranslationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (translations: TaskTranslation[]) => void;
  initialTranslations?: TaskTranslation[];
}

const TranslationDialog: React.FC<TranslationDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTranslations = [
    { title: '', description: '', language_code: 'fa' },
    { title: '', description: '', language_code: 'en' }
  ]
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<'fa' | 'en'>('fa');
  const [translations, setTranslations] = useState<TaskTranslation[]>(initialTranslations);

  if (!isOpen) return null;

  const getCurrentTranslation = () => {
    return translations.find(t => t.language_code === currentLanguage) || translations[0];
  };

  const updateTranslation = (field: keyof TaskTranslation, value: string) => {
    setTranslations(prev => prev.map(t =>
      t.language_code === currentLanguage
        ? { ...t, [field]: value }
        : t
    ));
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    onSubmit(translations);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md px-4 pt-5 pb-4 overflow-hidden text-right align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={20} />
            </button>
            <h3 className="text-lg font-medium text-gray-900">تنظیم عنوان و توضیحات</h3>
          </div>

          <div className="space-y-4">
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
              <label htmlFor={`title-${currentLanguage}`} className="block text-sm font-medium text-gray-700">
                عنوان {currentLanguage === 'fa' && '*'}
              </label>
              <input
                type="text"
                id={`title-${currentLanguage}`}
                value={getCurrentTranslation().title}
                onChange={(e) => updateTranslation('title', e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required={currentLanguage === 'fa'}
              />
            </div>

            <div>
              <label htmlFor={`description-${currentLanguage}`} className="block text-sm font-medium text-gray-700">
                توضیحات
              </label>
              <textarea
                id={`description-${currentLanguage}`}
                value={getCurrentTranslation().description}
                onChange={(e) => updateTranslation('description', e.target.value)}
                rows={3}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="mt-6 space-x-3 space-x-reverse text-left">
              <button
                onClick={handleSubmit}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                تایید
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationDialog;