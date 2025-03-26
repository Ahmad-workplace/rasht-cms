import React, { useState, useRef, KeyboardEvent } from 'react';
import { X, Plus, Upload, Image } from 'lucide-react';
import { Category, CreateProduct, Translation, Attachment } from '@/types/api';
import { translations } from '@/lib/constants/translations';
import MediaPickerModal from '@/components/common/MediaPickerModal';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit: (data: CreateProduct) => void;
}

interface ProductTranslation {
  name: string;
  description: string;
  specification: Record<string, string>;
  language_code: string;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateProduct>({
    category: "",
    translations: [
      {
        name: "",
        description: "",
        specification: {},
        language_code: "fa",
      },
      {
        name: "",
        description: "",
        specification: {},
        language_code: "en",
      },
    ],
    attachment: [],
  });

  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);

  const [currentLanguage, setCurrentLanguage] = useState<"fa" | "en">("fa");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const specKeyInputRef = useRef<HTMLInputElement>(null);
  const specValueInputRef = useRef<HTMLInputElement>(null);

  const getCurrentTranslation = () => {
    return (
      formData.translations.find((t) => t.language_code === currentLanguage) ||
      formData.translations[0]
    );
  };

  const updateTranslation = (
    field: keyof ProductTranslation,
    value: string
  ) => {
    setFormData({
      ...formData,
      translations: formData.translations.map((t) =>
        t.language_code === currentLanguage ? { ...t, [field]: value } : t
      ),
    });
  };

  const handleAddSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      const currentTranslation = getCurrentTranslation();
      setFormData({
        ...formData,
        translations: formData.translations.map((t) =>
          t.language_code === currentLanguage
            ? {
                ...t,
                specification: {
                  ...t.specification,
                  [specKey.trim()]: specValue.trim(),
                },
              }
            : t
        ),
      });
      setSpecKey("");
      setSpecValue("");
      specKeyInputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.currentTarget === specKeyInputRef.current) {
        specValueInputRef.current?.focus();
      } else if (e.currentTarget === specValueInputRef.current) {
        handleAddSpecification();
      }
    }
  };

  const handleRemoveSpecification = (key: string) => {
    setFormData({
      ...formData,
      translations: formData.translations.map((t) =>
        t.language_code === currentLanguage
          ? {
              ...t,
              specification: Object.fromEntries(
                Object.entries(t.specification).filter(([k]) => k !== key)
              ),
            }
          : t
      ),
    });
  };

  const handleAttachmentsSelect = (attachments: Attachment[]) => {
    setFormData({
      ...formData,
      attachment: attachments.map((a) => a.id),
    });
    setAttachmentUrls(attachments.map((a) => a.file));
    setShowMediaPicker(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const faTranslation = formData.translations.find(
      (t) => t.language_code === "fa"
    );
    if (
      !faTranslation?.name 
    ) {
      alert("لطفاً تمام فیلدهای اجباری فارسی را پر کنید");
      return;
    }

    if (!formData.category) {
      alert("لطفاً دسته‌بندی را انتخاب کنید");
      return;
    }


    onSubmit(formData);
    setFormData({
      category: "",
      translations: [
        {
          name: "",
          description: "",
          specification: {},
          language_code: "fa",
        },
        {
          name: "",
          description: "",
          specification: {},
          language_code: "en",
        },
      ],
      attachment: [],
    });
    setAttachmentUrls([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="inline-block w-full max-w-2xl px-4 pt-5 pb-4 overflow-hidden text-right align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-medium text-gray-900">
              {translations.products.addProduct}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                {translations.products.category} *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">
                  {translations.common.select} {translations.products.category}
                </option>
                {categories.map((category) => {
                  const faTranslation = category.translations.find(
                    (t) => t.language_code === "fa"
                  );
                  return (
                    <option key={category.id} value={category.id}>
                      {faTranslation?.name || category.translations[0]?.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Attachments Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translations.mediaLibrary.title} *
              </label>

              <div className="mt-1 flex items-center space-x-4 space-x-reverse">
                <div className="flex flex-wrap gap-4">
                  {attachmentUrls.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="relative w-16 h-16 rounded-lg overflow-hidden"
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            attachment: formData.attachment.filter(
                              (_, i) => i !== index
                            ),
                          });
                          setAttachmentUrls(
                            attachmentUrls.filter((_, i) => i !== index)
                          );
                        }}
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {attachmentUrls.length === 0 && (
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
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
                  currentLanguage === "fa"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setCurrentLanguage("fa")}
              >
                فارسی
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  currentLanguage === "en"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setCurrentLanguage("en")}
              >
                English
              </button>
            </div>

            {/* Translation Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor={`name-${currentLanguage}`} className="block text-sm font-medium text-gray-700">
                  {translations.products.productName} {currentLanguage === "fa" && "*"}
                </label>
                <input
                  type="text"
                  id={`name-${currentLanguage}`}
                  value={getCurrentTranslation().name}
                  onChange={(e) => updateTranslation("name", e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required={currentLanguage === "fa"}
                />
              </div>

              <div>
                <label htmlFor={`description-${currentLanguage}`} className="block text-sm font-medium text-gray-700">
                  {translations.companies.description} {currentLanguage === "fa" }
                </label>
                <textarea
                  id={`description-${currentLanguage}`}
                  value={getCurrentTranslation().description}
                  onChange={(e) =>
                    updateTranslation("description", e.target.value)
                  }
                  rows={3}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required={currentLanguage === "fa"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specification
                </label>

                {/* Existing Specifications */}
                {Object.entries(getCurrentTranslation().specification || {})
                  .length > 0 && (
                  <div className="mb-4 space-y-2">
                    {Object.entries(
                      getCurrentTranslation().specification || {}
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {key}
                          </span>
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
                      ref={specKeyInputRef}
                      type="text"
                      value={specKey}
                      onChange={(e) => setSpecKey(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Key"
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <input
                      ref={specValueInputRef}
                      type="text"
                      value={specValue}
                      onChange={(e) => setSpecValue(e.target.value)}
                      onKeyDown={handleKeyDown}
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
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {translations.products.addProduct}
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
            value={formData.attachment}
            onChange={handleAttachmentsSelect}
            multiple={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateProductModal;