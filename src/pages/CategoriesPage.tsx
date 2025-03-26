import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useApiQuery, useApiMutation } from '@/hooks';
import { getCategories, createCategory, deleteCategory, updateCategory } from '@/lib/api';
import { Package, Search, Plus, LayoutGrid, List, ChevronDown, ChevronRight } from 'lucide-react';
import { Category } from '@/types/api';
import { translations } from '@/lib/constants/translations';
import CreateCategoryModal from '@/components/modals/CreateCategoryModal';
import EditCategoryModal from '@/components/modals/EditCategoryModal';
import useToast from '@/hooks/useToast';
import { convertToFarsiNumber } from '@/lib/utils/numbers';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
type ViewMode = 'card' | 'list';

interface CategoryNode extends Category {
  children: CategoryNode[];
}

const CategoriesPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const toast = useToast();

  const { data: categories, isLoading, error, refetch } = useApiQuery(
    'categories',
    getCategories
  );

  // Transform flat categories into a hierarchical structure
  const categoryHierarchy = useMemo(() => {
    if (!categories) return [];

    const categoryMap = new Map<string, CategoryNode>();
    const rootCategories: CategoryNode[] = [];

    // First pass: Create CategoryNode objects for each category
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Second pass: Build the hierarchy
    categories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      if (category.parent) {
        const parentNode = categoryMap.get(category.parent);
        if (parentNode) {
          parentNode.children.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  }, [categories]);

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

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Filter categories by search term
  const filterCategory = (category: CategoryNode): boolean => {
    const faTranslation = category.translations.find(t => t.language_code === 'fa');
    const enTranslation = category.translations.find(t => t.language_code === 'en');
    
    const matchesSearch = !searchTerm || 
      faTranslation?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enTranslation?.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch || category.children.some(filterCategory);
  };

  const filteredCategories = useMemo(() => {
    if (!categoryHierarchy) return [];
    return categoryHierarchy.filter(filterCategory);
  }, [categoryHierarchy, searchTerm]);

  const renderCategoryNode = (category: CategoryNode, depth = 0) => {
    const faTranslation = category.translations.find(t => t.language_code === 'fa');
    const enTranslation = category.translations.find(t => t.language_code === 'en');
    const hasChildren = category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id} style={{ marginRight: `${depth * 1.5}rem` }}>
        <div className={`flex items-center p-4 hover:bg-gray-50 ${depth > 0 ? 'border-t' : ''}`}>
          <div className="flex-shrink-0 h-10 w-10 mr-4">
            {category.logo?.file ? (
              <img 
                src={category.logo.file}
                alt={faTranslation?.name || ''}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Package size={20} className="text-gray-500" />
              </div>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center">
              {hasChildren && (
                <button
                  onClick={() => toggleCategoryExpansion(category.id)}
                  className="p-1 hover:bg-gray-100 rounded-full mr-2"
                >
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-500" />
                  )}
                </button>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {faTranslation?.name || enTranslation?.name}
                </p>
                {enTranslation && faTranslation && enTranslation.name !== faTranslation.name && (
                  <p className="text-sm text-gray-500 truncate">
                    {enTranslation.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => handleEditCategory(category)}
              className="text-indigo-600 hover:text-indigo-900"
            >
              {translations.common.edit}
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="text-red-600 hover:text-red-900"
            >
              {translations.common.delete}
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-r border-gray-200 mr-5">
            {category.children.map(child => renderCategoryNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

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
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            {filteredCategories.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredCategories.map(category => renderCategoryNode(category))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
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