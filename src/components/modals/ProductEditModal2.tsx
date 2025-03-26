import React, { useState, useEffect } from 'react';
import { X, Plus, Upload, Image } from 'lucide-react';
import { Category, Product, Translation, Attachment } from '@/types/api';
import { translations } from '@/lib/constants/translations';
import MediaPickerModal from '@/components/common/MediaPickerModal';
import useToast from '@/hooks/useToast';

interface ProductEditModal2Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: Partial<Product>) => Promise<void>;
  product: Product;
  categories: Category[];
}

const ProductEditModal2: React.FC<ProductEditModal2Props> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  categories,
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    category: product.category,
    translations: product.translations,
    attachment: product.attachment.map(a => a.id),
  });

  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'fa' | 'en'>('fa');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>(product.attachment);
  const toast = useToast();

  // Reset form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        category: product.category,
        translations: product.translations,
        attachment: product.attachment.map(a => a.id),
      });
      setSelectedAttachments(product.attachment);
      setUnsavedChanges(false);
    }
  }, [product]);

  const getCurrentTranslation = () => {
    return formData.translations?.find(t => t.language_code === currentLanguage);
  };

  const updateTranslation = (field: keyof Translation, value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: prev.translations?.map(t =>
        t.language_code === currentLanguage
          ? { ...t, [field]: value }
          : t
      )
    }));
    setUnsavedChanges(true);
  };

  const handleAddSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      const currentTranslation = getCurrentTranslation();
      if (currentTranslation) {
        setFormData(prev => ({
          ...prev,
          translations: prev.translations?.map(t =>
            t.language_code === currentLanguage
              ? {
                  ...t,
                  specification: {
                    ...(t.specification || {}),
                    [specKey.trim()]: specValue.trim(),
                  },
                }
              : t
          )
        }));
      }
      setSpecKey('');
      setSpecValue('');
      setUnsavedChanges(true);
    }
  };

  const handleRemoveSpecification = (key: string) => {
    setFormData(prev => ({
      ...prev,
      translations: prev.translations?.map(t =>
        t.language_code === currentLanguage
          ? {
              ...t,
              specification: Object.fromEntries(
                Object.entries(t.specification || {}).filter(([k]) => k !== key)
              ),
            }
          : t
      )
    }));
    setUnsavedChanges(true);
  };

  const handleAttachmentsSelect = (attachments: Attachment[]) => {
    setFormData(prev => ({
      ...prev,
      attachment: attachments.map(a => a.id)
    }));
    setSelectedAttachments(attachments);
    setShowMediaPicker(false);
    setUnsavedChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const faTranslation = formData.translations?.find(t => t.language_code === 'fa');
    if (!faTranslation?.name ) {
      toast.error('لطفاً تمام فیلدهای اجباری فارسی را پر کنید');
      return;
    }

    if (!formData.category) {
      toast.error('لطفاً دسته‌بندی را انتخاب کنید');
      return;
    }

    // Only validate attachments if they've been modified and set to empty
    if (formData.attachment && formData.attachment.length === 0) {
      toast.error('لطفاً حداقل یک تصویر انتخاب کنید');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(product.id, formData);
      toast.success('محصول با موفقیت ویرایش شد');
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'خطا در ویرایش محصول');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-5xl px-4 pt-5 pb-4 overflow-hidden text-right align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={20} />
            </button>
            <h3 className="text-lg font-medium text-gray-900">{translations.products.editProduct}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selection */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                {translations.products.category} *
              </label>
              <select
                id="category"
                value={formData.category || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, category: e.target.value }));
                  setUnsavedChanges(true);
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">{translations.common.select} {translations.products.category}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.translations.find(t => t.language_code === 'fa')?.name || category.translations[0]?.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Attachments Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translations.mediaLibrary.title} 
              </label>
              <div className="mt-1 flex items-center space-x-4 space-x-reverse">
                <div className="flex flex-wrap gap-4">
                  {selectedAttachments.map((attachment) => (
                    <div key={attachment.id} className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <img
                        src={attachment.file}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
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

            {/* Translation Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor={`name-${currentLanguage}`} className="block text-sm font-medium text-gray-700">
                  {translations.products.productName} {currentLanguage === 'fa' && '*'}
                </label>
                <input
                  type="text"
                  id={`name-${currentLanguage}`}
                  value={getCurrentTranslation()?.name || ''}
                  onChange={(e) => updateTranslation('name', e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required={currentLanguage === 'fa'}
                />
              </div>

              <div>
                <label htmlFor={`description-${currentLanguage}`} className="block text-sm font-medium text-gray-700">
                  {translations.products.description} {currentLanguage === 'fa'}
                </label>
                <textarea
                  id={`description-${currentLanguage}`}
                  value={getCurrentTranslation()?.description || ''}
                  onChange={(e) => updateTranslation('description', e.target.value)}
                  rows={3}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required={currentLanguage === 'fa'}
                />
              </div>

              {/* Specifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translations.products.specifications}
                </label>

                {/* Existing Specifications */}
                {getCurrentTranslation()?.specification && Object.entries(getCurrentTranslation()?.specification).length > 0 && (
                  <div className="mb-4 space-y-2">
                    {Object.entries(getCurrentTranslation()?.specification || {}).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{key}</span>
                          <span className="text-gray-500 mx-2">•</span>
                          <span className="text-gray-700">{value}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecification(key)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Specification */}
                <div className="flex gap-2 items-center">
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={specKey}
                      onChange={(e) => setSpecKey(e.target.value)}
                      placeholder="Key"
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      value={specValue}
                      onChange={(e) => setSpecValue(e.target.value)}
                      placeholder="Value"
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSpecification}
                    disabled={!specKey.trim() || !specValue.trim()}
                    className="inline-flex items-center p-2 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 space-x-3 space-x-reverse text-left">
              <button
                type="submit"
                disabled={!unsavedChanges || isSubmitting}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? 'در حال ذخیره...' : translations.common.save}
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
            value={formData.attachment || []}
            onChange={handleAttachmentsSelect}
            multiple={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductEditModal2;