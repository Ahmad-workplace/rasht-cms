import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useApiQuery, useApiMutation } from '@/hooks';
import { getProducts, getCategories, createProduct, deleteProduct, updateProduct } from '@/lib/api';
import { Package, Search, Plus, Filter, Trash2, Edit } from 'lucide-react';
import CreateProductModal from '@/components/modals/CreateProductModal';
import ViewProductModal from '@/components/modals/ViewProductModal';
import EditProductModal from '@/components/modals/EditProductModal';
import { Category, Product } from '@/types/api';
import { translations } from '@/lib/constants/translations';
import { convertToFarsiNumber } from '@/lib/utils/numbers';
import useToast from '@/hooks/useToast';

const ProductsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const toast = useToast();
  
  const { data: productsData, isLoading: productsLoading, error: productsError, refetch } = useApiQuery(
    ['products', page.toString()],
    () => getProducts(page, 10),
    {
      keepPreviousData: true,
    }
  );
  
  const { data: categories, isLoading: categoriesLoading } = useApiQuery(
    'categories',
    getCategories
  );

  const createProductMutation = useApiMutation(createProduct, {
    onSuccess: () => {
      refetch();
      setIsCreateModalOpen(false);
      toast.success('محصول با موفقیت ایجاد شد');
    },
  });

  const deleteProductMutation = useApiMutation(deleteProduct, {
    onSuccess: () => {
      refetch();
      toast.success('محصول با موفقیت حذف شد');
    },
  });

  const editProductMutation = useApiMutation(
    ({ id, data }: { id: number; data: Partial<Product> }) => updateProduct(id, data),
    {
      onSuccess: () => {
        refetch();
        setIsEditModalOpen(false);
        toast.success('محصول با موفقیت ویرایش شد');
      },
    }
  );

  const handleCreateProduct = async (productData: any) => {
    try {
      await createProductMutation.mutateAsync(productData);
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  };

  const handleSubmitEditProduct = async (id: number, data: Partial<Product>) => {
    try {
      await editProductMutation.mutateAsync({ id, data });
    } catch (error) {
      console.error('Failed to edit product:', error);
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      try {
        await deleteProductMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };
  
  // Filter products by search term and category (client-side filtering)
  const filteredProducts = productsData?.results.filter(product => {
    const faTranslation = product.translations.find(t => t.language_code === 'fa');
    const matchesSearch = faTranslation?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faTranslation?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{translations.common.products}</h1>
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus size={16} className="ml-2" />
            {translations.products.addProduct}
          </button>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={`${translations.common.search} ${translations.common.products}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="sm:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
              <select
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                disabled={categoriesLoading}
              >
                <option value="">{translations.common.all} {translations.products.category}</option>
                {categories?.map((category: Category) => {
                  const faTranslation = category.translations.find(t => t.language_code === 'fa');
                  return (
                    <option key={category.id} value={category.id}>
                      {faTranslation?.name || category.translations[0]?.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
        
        {productsLoading ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">{translations.common.loading}</p>
          </div>
        ) : productsError ? (
          <div className="mt-6 text-center">
            <p className="text-red-500">{translations.common.error}</p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const faTranslation = product.translations.find(t => t.language_code === 'fa');
                  return (
                    <div key={product.id} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center ml-4">
                            {product.attachment && product.attachment.length > 0 ? (
                              <img 
                                src={product.attachment[0].file}
                                alt={faTranslation?.name} 
                                className="h-10 w-10 rounded-full object-cover" 
                              />
                            ) : (
                              <Package size={20} className="text-gray-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{faTranslation?.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">{faTranslation?.description}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <button 
                                onClick={() => handleViewProduct(product)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                {translations.common.view}
                              </button>
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                {translations.common.edit}
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-10 text-gray-500">
                  {translations.common.noResults}
                </div>
              )}
            </div>
            
            {productsData && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  نمایش <span className="font-medium">{convertToFarsiNumber((page - 1) * 10 + 1)}</span> تا{' '}
                  <span className="font-medium">
                    {convertToFarsiNumber(Math.min(page * 10, productsData.count))}
                  </span>{' '}
                  از <span className="font-medium">{convertToFarsiNumber(productsData.count)}</span> نتیجه
                </div>
                
                <div className="flex-1 flex justify-end">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    قبلی
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!productsData.next}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-l-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <CreateProductModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          categories={categories || []}
          onSubmit={handleCreateProduct}
        />

        {selectedProduct && (
          <ViewProductModal
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            product={selectedProduct}
          />
        )}

        {productToEdit && (
          <EditProductModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleSubmitEditProduct}
            product={productToEdit}
            categories={categories || []}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ProductsPage;