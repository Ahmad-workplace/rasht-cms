import React, { useState } from 'react';
import { X, Upload, Image } from 'lucide-react';
import { Product, Translation, Attachment } from '@/types/api';
import { translations } from '@/lib/constants/translations';
import MediaPicker from '@/components/common/MediaPicker';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: Partial<Product>) => void;
  product: Product;
  categories: Category[]; // Assuming categories are passed as an array
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, onSubmit, product, categories }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    ...product,
    translations: product.translations,
    category: product.category,
    attachment: product.attachment,
  });

  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'fa' | 'en'>('fa');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(product.id, formData);
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
            <h3 className="text-lg font-medium text-gray-900">{translations.products.editProduct}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {translations.products.productImage}
              </label>
              {showMediaPicker ? (
                <MediaPicker
                  value={formData.attachment || []}
                  onChange={(ids) => {
                    setFormData({ ...formData, attachment: ids });
                    setShowMediaPicker(false);
                  }}
                  onClose={() => setShowMediaPicker(false)}
                  multiple={true}
                />
              ) : (
                <div className="mt-1 flex items-center space-x-4 space-x-reverse">
                  {formData.attachment && formData.attachment.length > 0 ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <img
                        src={formData.attachment[0].file}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, attachment: [] })}
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
              )}
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
                  {translations.products.productName} *
                </label>
                <input
                  type="text"
                  id={`name-${currentLanguage}`}
                  value={formData.translations?.[currentLanguage]?.name || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    translations: {
                      ...formData.translations,
                      [currentLanguage]: {
                        ...formData.translations?.[currentLanguage],
                        name: e.target.value
                      }
                    }
                  })}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor={`description-${currentLanguage}`} className="block text-sm font-medium text-gray-700">
                  {translations.products.description} *
                </label>
                <textarea
                  id={`description-${currentLanguage}`}
                  value={formData.translations?.[currentLanguage]?.description || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    translations: {
                      ...formData.translations,
                      [currentLanguage]: {
                        ...formData.translations?.[currentLanguage],
                        description: e.target.value
                      }
                    }
                  })}
                  rows={3}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  {translations.products.category} *
                </label>
                <select
                  id="category"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">{translations.common.selectCategory}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.translations.find(t => t.language_code === 'fa')?.name || category.translations[0]?.name}
                    </option>
                  ))}
                </select>
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

export default EditProductModal;