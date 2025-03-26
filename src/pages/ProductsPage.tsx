import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useApiQuery, useApiMutation } from '@/hooks';
import { getProducts, getCategories, createProduct, deleteProduct, updateProduct, getProduct } from '@/lib/api';
import { Package, Search, Plus, Filter, Trash2, Edit2, LayoutGrid, List } from 'lucide-react';
import CreateProductModal from '@/components/modals/CreateProductModal';
import ViewProductModal from '@/components/modals/ViewProductModal';
import ProductEditModal2 from '@/components/modals/ProductEditModal2';
import { Category, Product } from '@/types/api';
import { translations } from '@/lib/constants/translations';
import useToast from '@/hooks/useToast';
import { convertToFarsiNumber } from '@/lib/utils/numbers';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
type ViewMode = 'card' | 'list';

const ProductsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const toast = useToast();
  
  const { data: productsData, isLoading: productsLoading, error: productsError, refetch } = useApiQuery(
    ['products', page.toString(), pageSize.toString()],
    () => getProducts(page, pageSize),
    {
      keepPreviousData: true,
      retry: 1,
      staleTime: 30000,
      cacheTime: 60000,
    }
  );
  
  const { data: categories, isLoading: categoriesLoading } = useApiQuery(
    'categories',
    getCategories,
    {
      staleTime: 30000,
      cacheTime: 60000,
    }
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

  const handleViewProduct = async (productId: number) => {
    try {
      const product = await getProduct(productId);
      setSelectedProduct(product);
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      toast.error('خطا در دریافت اطلاعات محصول');
    }
  };

  const handleEditProduct = async (productId: number) => {
    try {
      const product = await getProduct(productId);
      setProductToEdit(product);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      toast.error('خطا در دریافت اطلاعات محصول');
    }
  };

  const handleSubmitEditProduct = async (id: number, data: Partial<Product>) => {
    try {
      await editProductMutation.mutateAsync({ id, data });
    } catch (error) {
      console.error('Failed to edit product:', error);
    }
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

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };
  
  const filteredProducts = productsData?.results.filter(product => {
    const faTranslation = product.translations?.find(t => t.language_code === 'fa');
    const matchesSearch = !searchTerm || (faTranslation?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faTranslation?.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const renderListView = () => (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              محصول
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              دسته‌بندی
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              عملیات
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredProducts && filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const faTranslation = product.translations?.find(t => t.language_code === 'fa');
              const enTranslation = product.translations?.find(t => t.language_code === 'en');
              const categoryTranslation = categories?.find(c => c.id === product.category)?.translations.find(t => t.language_code === 'fa');
              
              return (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-normal">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {product.attachment && product.attachment.length > 0 ? (
                          <img 
                            src={product.attachment[0].file}
                            alt={faTranslation?.name || 'محصول'}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Package size={20} className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="mr-4 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {faTranslation?.name || enTranslation?.name || 'بدون عنوان'}
                        </div>
                        {faTranslation?.description && (
                          <div className="text-sm text-gray-500 line-clamp-2 max-w-md">
                            {faTranslation.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{categoryTranslation?.name || 'بدون دسته‌بندی'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleViewProduct(product.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {translations.common.view}
                      </button>
                      <button
                        onClick={() => handleEditProduct(product.id)}
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
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                {translations.common.noResults}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredProducts && filteredProducts.length > 0 ? (
        filteredProducts.map((product) => {
          const faTranslation = product.translations?.find(t => t.language_code === 'fa');
          const enTranslation = product.translations?.find(t => t.language_code === 'en');
          
          return (
            <div key={product.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center ml-4">
                    {product.attachment && product.attachment.length > 0 ? (
                      <img 
                        src={product.attachment[0].file}
                        alt={faTranslation?.name || 'محصول'} 
                        className="h-10 w-10 rounded-full object-cover" 
                      />
                    ) : (
                      <Package size={20} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {faTranslation?.name || enTranslation?.name || 'بدون عنوان'}
                    </h3>
                    {faTranslation?.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {faTranslation.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-end space-x-2 space-x-reverse">
                    <button 
                      onClick={() => handleViewProduct(product.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {translations.common.view}
                    </button>
                    <button
                      onClick={() => handleEditProduct(product.id)}
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
          );
        })
      ) : (
        <div className="col-span-full text-center py-10 text-gray-500">
          {translations.common.noResults}
        </div>
      )}
    </div>
  );

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

          <div className="sm:w-48">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>
                  {convertToFarsiNumber(size)} مورد در صفحه
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-md ${
                viewMode === 'card'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="نمایش کارتی"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="نمایش لیستی"
            >
              <List size={20} />
            </button>
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
            <div className="mt-6">
              {viewMode === 'card' ? renderCardView() : renderListView()}
            </div>
            
            {productsData && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  نمایش <span className="font-medium">{convertToFarsiNumber((page - 1) * pageSize + 1)}</span> تا{' '}
                  <span className="font-medium">
                    {convertToFarsiNumber(Math.min(page * pageSize, productsData.count))}
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
          <ProductEditModal2
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setProductToEdit(null);
            }}
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