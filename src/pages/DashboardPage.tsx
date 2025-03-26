import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth, useApiQuery } from '@/hooks';
import { translations } from '@/lib/constants/translations';
import { getProducts, getPlaylists, getAttachments, getCategories, getQuestions } from '@/lib/api';
import { convertToFarsiNumber } from '@/lib/utils/numbers';
import { Package, PlaySquare, Image, LayoutGrid, BarChart } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch all required data
  const { data: productsData, isLoading: productsLoading } = useApiQuery(
    'products',
    () => getProducts(1, 1), // We only need the count
    {
      staleTime: 30000,
      cacheTime: 60000,
    }
  );
  
  const { data: playlists, isLoading: playlistsLoading } = useApiQuery(
    'playlists',
    getPlaylists,
    {
      staleTime: 30000,
      cacheTime: 60000,
    }
  );

  const { data: attachments, isLoading: attachmentsLoading } = useApiQuery(
    'attachments',
    getAttachments,
    {
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

  const { data: polls, isLoading: pollsLoading } = useApiQuery(
    'polls',
    getQuestions,
    {
      staleTime: 30000,
      cacheTime: 60000,
    }
  );
  
  const isLoading = productsLoading || playlistsLoading || attachmentsLoading || categoriesLoading || pollsLoading;

  const stats = [
    {
      name: 'محصولات',
      value: productsData?.count || 0,
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
      loading: productsLoading,
    },
    {
      name: 'دسته‌بندی‌ها',
      value: categories?.length || 0,
      icon: LayoutGrid,
      color: 'bg-purple-50 text-purple-600',
      loading: categoriesLoading,
    },
    {
      name: 'پلی‌لیست‌ها',
      value: playlists?.length || 0,
      icon: PlaySquare,
      color: 'bg-green-50 text-green-600',
      loading: playlistsLoading,
    },
    {
      name: 'رسانه‌ها',
      value: attachments?.length || 0,
      icon: Image,
      color: 'bg-amber-50 text-amber-600',
      loading: attachmentsLoading,
    },
    {
      name: 'نظرسنجی‌ها',
      value: polls?.length || 0,
      icon: BarChart,
      color: 'bg-rose-50 text-rose-600',
      loading: pollsLoading,
    },
  ];
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">{translations.common.dashboard}</h1>
        
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="mr-5">
                      <p className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </p>
                      <p className="mt-1 text-3xl font-semibold text-gray-900">
                        {stat.loading ? (
                          <span className="inline-block w-16 h-8 bg-gray-200 animate-pulse rounded"></span>
                        ) : (
                          convertToFarsiNumber(stat.value)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional sections can be added here */}
      </div>
    </MainLayout>
  );
};

export default DashboardPage;