import React from 'react';
import { X, Package, Calendar, Tag, Building2, Info, Globe } from 'lucide-react';
import { Product } from '@/types/api';
import { translations } from '@/lib/constants/translations';
import { BASE_URL } from '@/lib/api/client';

interface ViewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

const ViewProductModal: React.FC<ViewProductModalProps> = ({ isOpen, onClose, product }) => {
  const faTranslation = product.translations.find(t => t.language_code === 'fa');
  const enTranslation = product.translations.find(t => t.language_code === 'en');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl px-4 pt-5 pb-4 overflow-hidden text-right align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={24} />
            </button>
            <h3 className="text-xl font-semibold text-gray-900">جزئیات محصول</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Info Section */}
            <div className="space-y-6">
              {/* Product Header */}
              <div className="flex items-start space-x-4 space-x-reverse">
                <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {product.attachment && product.attachment.length > 0 ? (
                    <img 
                      src={product.attachment[0].file}
                      alt={faTranslation?.name || ''}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <Package size={32} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {faTranslation?.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {enTranslation?.name}
                  </p>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center text-sm">
                  <Tag className="h-5 w-5 text-gray-400 ml-2" />
                  <span className="font-medium text-gray-700 ml-2">شناسه:</span>
                  <span className="text-gray-600">{product.id}</span>
                </div>

                {product.category && (
                  <div className="flex items-center text-sm">
                    <Building2 className="h-5 w-5 text-gray-400 ml-2" />
                    <span className="font-medium text-gray-700 ml-2">دسته‌بندی:</span>
                    <span className="text-gray-600">{product.category}</span>
                  </div>
                )}

                {product.warranty && (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-5 w-5 text-gray-400 ml-2" />
                    <span className="font-medium text-gray-700 ml-2">گارانتی:</span>
                    <span className="text-gray-600">{product.warranty} ماه</span>
                  </div>
                )}
              </div>

              {/* Translations */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">توضیحات</h4>
                <div className="space-y-4">
                  {/* Persian Description */}
                  {faTranslation?.description && (
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Globe className="h-4 w-4 text-gray-400 ml-2" />
                        <span className="text-sm font-medium text-gray-700">فارسی</span>
                      </div>
                      <p className="text-gray-600 text-sm whitespace-pre-line">
                        {faTranslation.description}
                      </p>
                    </div>
                  )}

                  {/* English Description */}
                  {enTranslation?.description && (
                    <div className="bg-white border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Globe className="h-4 w-4 text-gray-400 ml-2" />
                        <span className="text-sm font-medium text-gray-700">English</span>
                      </div>
                      <p className="text-gray-600 text-sm whitespace-pre-line">
                        {enTranslation.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Specifications and Images */}
            <div className="space-y-6">
              {/* Specifications */}
              {(faTranslation?.specification || enTranslation?.specification) && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">مشخصات فنی</h4>
                  <div className="bg-white border rounded-lg divide-y">
                    {Object.entries(faTranslation?.specification || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3">
                        <span className="text-sm font-medium text-gray-500">{key}</span>
                        <span className="text-sm text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Images Gallery */}
              {product.attachment && product.attachment.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">تصاویر</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {product.attachment.map((attachment) => (
                      <div key={attachment.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={attachment.file}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;