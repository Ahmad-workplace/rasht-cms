import React from 'react';
import { X, Package, Calendar, Tag, Building2 } from 'lucide-react';
import { Product } from '@/types/api';

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

        <div className="inline-block w-full max-w-3xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Product Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={20} />
            </button>
          </div>

          <div className="mt-4">
            {/* Product Header */}
            <div className="flex items-start">
              <div className="flex-shrink-0 h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center">
                {product.attachment && product.attachment.length > 0 ? (
                  <img 
                    src={`/_/upload/${product.attachment[0]}/`}
                    alt={faTranslation?.name || ''}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                ) : (
                  <Package size={32} className="text-gray-400" />
                )}
              </div>
              <div className="ml-6 flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{faTranslation?.name}</h2>
                <p className="text-sm text-gray-500">{enTranslation?.name}</p>
                <div className="mt-1 flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_available ? 'Available' : 'Unavailable'}
                  </span>
                  {product.is_active && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Product Details Grid */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="border rounded-lg p-4">
                <div className="flex items-center text-sm font-medium text-gray-500">
                  <Building2 size={16} className="mr-2" />
                  Company
                </div>
                <div className="mt-1 text-sm text-gray-900">{product.company}</div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center text-sm font-medium text-gray-500">
                  <Tag size={16} className="mr-2" />
                  Category
                </div>
                <div className="mt-1 text-sm text-gray-900">{product.category}</div>
              </div>

              {product.warranty && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center text-sm font-medium text-gray-500">
                    <Calendar size={16} className="mr-2" />
                    Warranty
                  </div>
                  <div className="mt-1 text-sm text-gray-900">{product.warranty} months</div>
                </div>
              )}
            </div>

            {/* Translations */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Translations</h4>
              <div className="space-y-4">
                {product.translations.map((translation) => (
                  <div key={translation.language_code} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {translation.language_code === 'fa' ? 'Persian' : 'English'}
                      </span>
                    </div>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{translation.name}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Unit</dt>
                        <dd className="mt-1 text-sm text-gray-900">{translation.unit}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Price</dt>
                        <dd className="mt-1 text-sm text-gray-900">{translation.price}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                        <dd className="mt-1 text-sm text-gray-900">{translation.description}</dd>
                      </div>
                      {Object.entries(translation.specification || {}).length > 0 && (
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500 mb-2">Specifications</dt>
                          <dd className="mt-1">
                            <ul className="divide-y divide-gray-200 border rounded-lg">
                              {Object.entries(translation.specification || {}).map(([key, value]) => (
                                <li key={`${translation.language_code}-${key}`} className="px-4 py-3 flex items-center justify-between text-sm">
                                  <span className="font-medium text-gray-600">{key}</span>
                                  <span className="text-gray-900">{value}</span>
                                </li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                ))}
              </div>
            </div>

            {/* Images Gallery */}
            {product.attachment && product.attachment.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Images</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {product.attachment.map((attachmentId) => (
                    <div key={attachmentId} className="relative aspect-w-3 aspect-h-2">
                      <img
                        src={`/_/upload/${attachmentId}/`}
                        alt=""
                        className="object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;