import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useApiQuery, useApiMutation } from '@/hooks';
import { getPlaylists, createPlaylist, deletePlaylist, updatePlaylist } from '@/lib/api';
import { PlaySquare, Plus, Search, LayoutGrid, List } from 'lucide-react';
import CreatePlaylistModal from '@/components/modals/CreatePlaylistModal';
import EditPlaylistModal from '@/components/modals/EditPlaylistModal';
import { Playlist } from '@/types/api';
import { translations } from '@/lib/constants/translations';
import useToast from '@/hooks/useToast';
import { convertToFarsiNumber } from '@/lib/utils/numbers';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
type ViewMode = 'card' | 'list';

const PlaylistsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const { data: playlists, isLoading, error, refetch } = useApiQuery(
    'playlists',
    getPlaylists
  );

  const createPlaylistMutation = useApiMutation(createPlaylist, {
    onSuccess: () => {
      refetch();
      setIsCreateModalOpen(false);
      toast.success(translations.playlists.createSuccess);
    },
  });

  const updatePlaylistMutation = useApiMutation(
    ({ id, data }: { id: string; data: Partial<Playlist> }) => updatePlaylist(id, data),
    {
      onSuccess: () => {
        refetch();
        setEditingPlaylistId(null);
        toast.success('پلی‌لیست با موفقیت به‌روزرسانی شد');
      },
    }
  );

  const deletePlaylistMutation = useApiMutation(deletePlaylist, {
    onSuccess: () => {
      refetch();
      toast.success(translations.playlists.deleteSuccess);
    },
  });

  const handleCreatePlaylist = async (data: { 
    title: string; 
    is_active: boolean; 
    schedules: any[];
  }) => {
    try {
      await createPlaylistMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to create playlist:', error);
    }
  };

  const handleUpdatePlaylist = async (id: string, data: Partial<Playlist>) => {
    try {
      await updatePlaylistMutation.mutateAsync({ id, data });
    } catch (error) {
      console.error('Failed to update playlist:', error);
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (window.confirm(translations.playlists.deleteConfirm)) {
      try {
        await deletePlaylistMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete playlist:', error);
      }
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  // Filter playlists by search term
  const filteredPlaylists = playlists?.filter(playlist => {
    if (!searchTerm) return true;
    return playlist.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Paginate playlists
  const paginatedPlaylists = filteredPlaylists?.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalPages = Math.ceil((filteredPlaylists?.length || 0) / pageSize);

  const renderCardView = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {paginatedPlaylists && paginatedPlaylists.length > 0 ? (
        paginatedPlaylists.map((playlist) => (
          <div key={playlist.id} className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center ml-4">
                    <PlaySquare className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{playlist.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      playlist.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {playlist.is_active ? translations.playlists.active : translations.playlists.inactive}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-4 sm:px-6">
              <div className="flex justify-end space-x-3 space-x-reverse">
                <button 
                  onClick={() => setEditingPlaylistId(playlist.id)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {translations.common.edit}
                </button>
                <button 
                  onClick={() => handleDeletePlaylist(playlist.id)}
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  {translations.common.delete}
                </button>
              </div>
            </div>
          </div>
        ))
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
              شناسه
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              عنوان
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              وضعیت
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              عملیات
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedPlaylists && paginatedPlaylists.length > 0 ? (
            paginatedPlaylists.map((playlist) => (
              <tr key={playlist.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {playlist.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <PlaySquare className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="mr-4">
                      <div className="text-sm font-medium text-gray-900">
                        {playlist.title}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    playlist.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {playlist.is_active ? translations.playlists.active : translations.playlists.inactive}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => setEditingPlaylistId(playlist.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {translations.common.edit}
                    </button>
                    <button
                      onClick={() => handleDeletePlaylist(playlist.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {translations.common.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
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
          <h1 className="text-2xl font-semibold text-gray-900">{translations.playlists.title}</h1>
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus size={16} className="ml-2" />
            {translations.playlists.addPlaylist}
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
              placeholder="جستجو در پلی‌لیست‌ها..."
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

            {filteredPlaylists && filteredPlaylists.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  نمایش <span className="font-medium">{convertToFarsiNumber((page - 1) * pageSize + 1)}</span> تا{' '}
                  <span className="font-medium">
                    {convertToFarsiNumber(Math.min(page * pageSize, filteredPlaylists.length))}
                  </span>{' '}
                  از <span className="font-medium">{convertToFarsiNumber(filteredPlaylists.length)}</span> نتیجه
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

        <CreatePlaylistModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePlaylist}
        />

        {editingPlaylistId && (
          <EditPlaylistModal
            isOpen={!!editingPlaylistId}
            onClose={() => setEditingPlaylistId(null)}
            playlistId={editingPlaylistId}
            onSubmit={handleUpdatePlaylist}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default PlaylistsPage;