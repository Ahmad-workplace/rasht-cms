import React, { useState } from 'react';
import { X } from 'lucide-react';
import { QuestionSerialzer } from '@/types/poll.type';
import { translations } from '@/lib/constants/translations';

interface EditPollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<QuestionSerialzer>) => void;
  poll: QuestionSerialzer;
}

const EditPollModal: React.FC<EditPollModalProps> = ({ isOpen, onClose, onSubmit, poll }) => {
  const [formData, setFormData] = useState<Partial<QuestionSerialzer>>({
    translations: poll.translations,
  });

  const [currentLanguage, setCurrentLanguage] = useState<'fa' | 'en'>('fa');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(poll.id, formData);
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
            <h3 className="text-lg font-medium text-gray-900">{translations.polls.editPoll}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                <label htmlFor={`text-${currentLanguage}`} className="block text-sm font-medium text-gray-700">
                  {translations.polls.question} *
                </label>
                <input
                  type="text"
                  id={`text-${currentLanguage}`}
                  value={
                    formData.translations?.find((t) => t.language_code === currentLanguage)?.text || ''
                  }
                  onChange={(e) => {
                    const updatedTranslations = formData.translations?.map((translation) =>
                      translation.language_code === currentLanguage
                        ? { ...translation, text: e.target.value }
                        : translation
                    );
                    setFormData({
                      ...formData,
                      translations: updatedTranslations,
                    });
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div className="mt-6 space-x-3 space-x-reverse text-left">
              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {translations.common.save}
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
        </div>
      </div>
    </div>
  );
};

export default EditPollModal;