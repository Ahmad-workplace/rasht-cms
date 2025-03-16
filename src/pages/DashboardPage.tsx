import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth, useApiQuery } from '@/hooks';
import { translations } from '@/lib/constants/translations';
import { getCompanies, getProducts, getPlaylists, getNotifications } from '@/lib/api';
import { convertToFarsiNumber } from '@/lib/utils/numbers';
import { formatDistanceToNow } from '@/lib/utils/dates';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  
 
  const { data: productsData, isLoading: productsLoading } = useApiQuery(
    'products',
    () => getProducts(1, 1) // We only need the count, so fetch minimal data
  );
  
  const { data: playlists, isLoading: playlistsLoading } = useApiQuery(
    'playlists',
    getPlaylists
  );

  
  const isLoading =  productsLoading || playlistsLoading;
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">{translations.common.dashboard}</h1>
        
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              {translations.common.welcome}، {user?.first_name || user?.username || 'کاربر'}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {translations.dashboard.systemOverview}
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              
              <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-green-800">{translations.common.products}</h3>
                {isLoading ? (
                  <p className="text-3xl font-bold text-green-600">...</p>
                ) : (
                  <p className="text-3xl font-bold text-green-600">
                    {convertToFarsiNumber(productsData?.count || 0)}
                  </p>
                )}
                <p className="text-sm text-green-500">{translations.dashboard.activeProducts}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-purple-800">{translations.common.playlists}</h3>
                {isLoading ? (
                  <p className="text-3xl font-bold text-purple-600">...</p>
                ) : (
                  <p className="text-3xl font-bold text-purple-600">
                    {convertToFarsiNumber(playlists?.length || 0)}
                  </p>
                )}
                <p className="text-sm text-purple-500">{translations.dashboard.activePlaylists}</p>
              </div>
            </div>
          </div>
        </div>
        
     
      </div>
    </MainLayout>
  );
};

export default DashboardPage;