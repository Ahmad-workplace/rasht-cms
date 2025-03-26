import { Playlist, PlaylistDetail, PlaylistSummary } from '@/types/api';
import apiClient from '@/lib/api/client';

/**
 * Get playlists list
 */
export const getPlaylists = async (): Promise<PlaylistSummary[]> => {
  const response = await apiClient.get<PlaylistSummary[]>('/player/playlists/');
  return response.data;
};

/**
 * Get playlist by ID
 */
export const getPlaylist = async (id: string): Promise<Playlist> => {
  const response = await apiClient.get<Playlist>(`/player/playlists/${id}/`);
  return response.data;
};

/**
 * Get detailed playlist information by ID
 */
export const getPlaylistDetails = async (id: string): Promise<PlaylistDetail> => {
  const response = await apiClient.get<PlaylistDetail>(`/player/playlists/${id}/`);
  return response.data;
};

/**
 * Create new playlist
 */
export const createPlaylist = async (playlistData: Omit<PlaylistDetail, 'id'>): Promise<PlaylistDetail> => {
  const payload = {
    title: playlistData.title,
    is_active: playlistData.is_active,
    schedules: playlistData.schedules.map(schedule => ({
      attachment: schedule.attachment.id,
      day: schedule.day,
      start_time: schedule.start_time.includes(':00') ? schedule.start_time : `${schedule.start_time}:00`,
      end_time: schedule.end_time.includes(':00') ? schedule.end_time : `${schedule.end_time}:00`,
      translations: schedule.translations
    }))
  };

  const response = await apiClient.post<PlaylistDetail>('/player/playlists/', payload);
  return response.data;
};

/**
 * Update playlist
 */
export const updatePlaylist = async (id: string, playlistData: Partial<PlaylistDetail>): Promise<PlaylistDetail> => {
  const payload = {
    title: playlistData.title,
    is_active: playlistData.is_active,
    schedules: playlistData.schedules?.map(schedule => ({
      attachment: schedule.attachment.id,
      day: schedule.day,
      start_time: schedule.start_time.includes(':00') ? schedule.start_time : `${schedule.start_time}:00`,
      end_time: schedule.end_time.includes(':00') ? schedule.end_time : `${schedule.end_time}:00`,
      translations: schedule.translations
    }))
  };

  const response = await apiClient.patch<PlaylistDetail>(`/player/playlists/${id}/`, payload);
  return response.data;
};

/**
 * Delete playlist
 */
export const deletePlaylist = async (id: string): Promise<void> => {
  await apiClient.delete(`/player/playlists/${id}/`);
};