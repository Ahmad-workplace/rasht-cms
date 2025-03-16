import { Playlist } from '@/types/api';
import apiClient from '@/lib/api/client';

/**
 * Get playlists list
 */
export const getPlaylists = async (): Promise<Playlist[]> => {
  const response = await apiClient.get<Playlist[]>('/player/playlists/');
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
 * Create new playlist
 */
export const createPlaylist = async (playlistData: Omit<Playlist, 'id'>): Promise<Playlist> => {
  const response = await apiClient.post<Playlist>('/player/playlists/', playlistData);
  return response.data;
};

/**
 * Update playlist
 */
export const updatePlaylist = async (id: string, playlistData: Partial<Playlist>): Promise<Playlist> => {
  const response = await apiClient.patch<Playlist>(`/player/playlists/${id}/`, playlistData);
  return response.data;
};

/**
 * Delete playlist
 */
export const deletePlaylist = async (id: string): Promise<void> => {
  await apiClient.delete(`/player/playlists/${id}/`);
};