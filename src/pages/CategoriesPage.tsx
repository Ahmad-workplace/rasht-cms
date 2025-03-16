import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useApiQuery, useApiMutation } from '@/hooks';
import { getCategories, createCategory, deleteCategory } from '@/lib/api';
import { Package, Search, Plus, Trash2 } from 'lucide-react';
import { Category } from '@/types/api';
import { translations } from '@/lib/constants/translations';
import CreateCategoryModal from '@/components/modals/CreateCategoryModal';
import useToast from '@/hooks/useToast';

const CategoriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm(translations.categories.deleteConfirm)) {
      try {
        await deleteCategoryMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };
  
  // Filter categories by search term
  const filteredCategories = categories?.filter(category => {
    const faTranslation = category.translations.find(t => t.language_code === 'fa');
    const enTranslation = category.translations.find(t => t.language_code === 'en');
    
    return faTranslation?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           enTranslation?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
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
        
        <div className="mt-4">
          <div className="relative">
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
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories && filteredCategories.length > 0 ? (
              filteredCategories.map((category) => {
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
                      
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 size={14} className="ml-1" />
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
        )}

        <CreateCategoryModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCategory}
        />
      </div>
    </MainLayout>
  );
};

export default CategoriesPage;