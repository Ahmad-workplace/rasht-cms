import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useApiQuery, useApiMutation } from '@/hooks';
import { getCategories, createCategory, deleteCategory, updateCategory } from '@/lib/api';
import { Package, Search, Plus, LayoutGrid, List, Edit2 } from 'lucide-react';
import { Category } from '@/types/api';
import { translations } from '@/lib/constants/translations';
import CreateCategoryModal from '@/components/modals/CreateCategoryModal';
import EditCategoryModal from '@/components/modals/EditCategoryModal';
import useToast from '@/hooks/useToast';
import { convertToFarsiNumber } from '@/lib/utils/numbers';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

type ViewMode = 'card' | 'list';

const CategoriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const toast = useToast();
  
  const { data: categories, isLoading, error, refetch } = useApiQuery(
    'categories',
    getCategories
  );

  const createCategoryMutation = useApiMutation(createCategory, {
    onSuccess: () => {
      refetch();
      setIsCreateModalOpen(false);
      toast.success(translations.categories.createSuccess);
    },
  });

  const updateCategoryMutation = useApiMutation(
    ({ id, data }: { id: string; data: Partial<Category> }) => updateCategory(id, data),
    {
      onSuccess: () => {
        refetch();
        setSelectedCategory(null);
        toast.success('دسته‌بندی با موفقیت ویرایش شد');
      },
    }
  );

  const deleteCategoryMutation = useApiMutation(deleteCategory, {
    onSuccess: () => {
      refetch();
      toast.success(translations.categories.deleteSuccess);
    },
  });
  
  const handleCreateCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      await createCategoryMutation.mutateAsync(categoryData);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleUpdateCategory = async (id: string, data: Partial<Category>) => {
    try {
      await updateCategoryMutation.mutateAsync({ id, data });
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm(translations.categories.deleteConfirm)) {
      try {
        await deleteCategoryMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };
  
  // Filter categories by search term
  const filteredCategories = categories?.filter(category => {
    const faTranslation = category.translations.find(t => t.language_code === 'fa');
    const enTranslation = category.translations.find(t => t.language_code === 'en');
    
    return faTranslation?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           enTranslation?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Paginate categories
  const paginatedCategories = filteredCategories?.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalPages = Math.ceil((filteredCategories?.length || 0) / pageSize);

  const renderCardView = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {paginatedCategories && paginatedCategories.length > 0 ? (
        paginatedCategories.map((category) => {
          const faTranslation = category.translations.find(t => t.language_code === 'fa');
          const enTranslation = category.translations.find(t => t.language_code === 'en');
          
          return (
            <div key={category.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center ml-4">
                    {category.logo ? (
                      <img 
                        src={category.logo} 
                        alt={faTranslation?.name || enTranslation?.name} 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <Package size={20} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {faTranslation?.name || enTranslation?.name}
                    </h3>
                    {faTranslation && enTranslation && faTranslation.name !== enTranslation.name && (
                      <p className="text-sm text-gray-500">{enTranslation.name}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Edit2 className="w-4 h-4 ml-1" />
                    {translations.common.edit}
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {translations.common.delete}
                  </button>
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

  const renderListView = () => (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              نام دسته‌بندی
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              نام انگلیسی
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              عملیات
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedCategories && paginatedCategories.length > 0 ? (
            paginatedCategories.map((category) => {
              const faTranslation = category.translations.find(t => t.language_code === 'fa');
              const enTranslation = category.translations.find(t => t.language_code === 'en');
              
              return (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {category.logo ? (
                          <img 
                            src={category.logo}
                            alt={faTranslation?.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Package size={20} className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">
                          {faTranslation?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {enTranslation?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="w-4 h-4 ml-1" />
                        {translations.common.edit}
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {translations.common.delete}
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
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{translations.categories.title}</h1>
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus size={16} className="ml-2" />
            {translations.categories.addCategory}
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
              placeholder={`${translations.common.search} ${translations.categories.title}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
        
        {isLoading ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">{translations.common.loading}</p>
          </div>
        ) : error ? (
          <div className="mt-6 text-center">
            <p className="text-red-500">{translations.common.error}</p>
          </div>
        ) : (
          <>
            <div className="mt-6">
              {viewMode === 'card' ? renderCardView() : renderListView()}
            </div>
            
            {filteredCategories && filteredCategories.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  نمایش <span className="font-medium">{convertToFarsiNumber((page - 1) * pageSize + 1)}</span> تا{' '}
                  <span className="font-medium">
                    {convertToFarsiNumber(Math.min(page * pageSize, filteredCategories.length))}
                  </span>{' '}
                  از <span className="font-medium">{convertToFarsiNumber(filteredCategories.length)}</span> نتیجه
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
                    disabled={page >= totalPages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-l-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <CreateCategoryModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCategory}
        />

        {selectedCategory && (
          <EditCategoryModal
            isOpen={!!selectedCategory}
            onClose={() => setSelectedCategory(null)}
            onSubmit={handleUpdateCategory}
            category={selectedCategory}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default CategoriesPage;