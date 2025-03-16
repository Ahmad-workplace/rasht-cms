import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useApiQuery, useApiMutation } from '@/hooks';
import { getPlaylists, createPlaylist, deletePlaylist, updatePlaylist } from '@/lib/api';
import { PlaySquare, Plus, Calendar } from 'lucide-react';
import CreatePlaylistModal from '@/components/modals/CreatePlaylistModal';
import EditPlaylistModal from '@/components/modals/EditPlaylistModal';
import { WeekSchedule, Playlist } from '@/types/api';
import { translations } from '@/lib/constants/translations';
import useToast from '@/hooks/useToast';

const PlaylistsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
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
    schedules: Omit<WeekSchedule, 'id'>[] 
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

  const getDayName = (day: number): string => {
    const days = [
      translations.playlists.days.sunday,
      translations.playlists.days.monday,
      translations.playlists.days.tuesday,
      translations.playlists.days.wednesday,
      translations.playlists.days.thursday,
      translations.playlists.days.friday,
      translations.playlists.days.saturday
    ];
    return days[day];
  };

  const formatTime = (time: string): string => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('fa-IR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

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

        {isLoading ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">{translations.common.loading}</p>
          </div>
        ) : error ? (
          <div className="mt-6 text-center">
            <p className="text-red-500">{translations.common.error}</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {playlists && playlists.length > 0 ? (
              playlists.map((playlist) => (
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
                    <h4 className="text-sm font-medium text-gray-900 mb-3">{translations.playlists.schedule}</h4>
                    <div className="space-y-2">
                      {playlist.schedules.map((schedule) => (
                        <div key={schedule.id} className="flex items-center text-sm text-gray-500">
                          <Calendar size={16} className="ml-2 text-gray-400" />
                          <span className="font-medium">{getDayName(schedule.day)}:</span>
                          <span className="mr-2">
                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </span>
                        </div>
                      ))}
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
        )}
      </div>

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
    </MainLayout>
  );
};

export default PlaylistsPage;