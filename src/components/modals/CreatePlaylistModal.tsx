import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Attachment } from '@/types/api';
import { translations } from '@/lib/constants/translations';
import Scheduler, { DAYS_OF_WEEK } from '@/components/scheduler/Scheduler';
import { Task } from '@/components/scheduler/types';
import { useApiQuery, useApiMutation } from '@/hooks';
import { getAttachments, uploadAttachment } from '@/lib/api';
import useToast from '@/hooks/useToast';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    is_active: boolean;
    schedules: {
      attachment: string;
      day: number;
      start_time: string;
      end_time: string;
      translations: {
        title: string;
        description: string;
        language_code: string;
      }[];
    }[];
  }) => void;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [scheduledTasks, setScheduledTasks] = useState<Task[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<'fa' | 'en'>('fa');
  const toast = useToast();

  // Fetch media attachments
  const { data: attachments, isLoading: attachmentsLoading, refetch: refetchAttachments } = useApiQuery(
    'attachments',
    getAttachments,
    {
      enabled: isOpen,
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || translations.common.error);
      }
    }
  );

  const uploadMutation = useApiMutation(uploadAttachment, {
    onSuccess: () => {
      refetchAttachments();
      setIsUploading(false);
      toast.success(translations.mediaLibrary.uploadSuccess);
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      setIsUploading(false);
      toast.error(error?.response?.data?.message || translations.mediaLibrary.uploadError);
    }
  });

  // Convert attachments to scheduler tasks
  const initialTasks: Task[] = attachments?.map((attachment: Attachment) => ({
    id: attachment.id,
    content: attachment.title || 'پخش رسانه',
    day: '',
    time: '',
    duration: attachment.duration ? Math.ceil(attachment.duration * 60) : 60,
    mediaType: attachment.type,
    mediaUrl: attachment.file,
    thumbnail: attachment.thumbnail,
    translations: [
      { title: attachment.title || '', description: '', language_code: 'fa' },
      { title: attachment.title || '', description: '', language_code: 'en' }
    ]
  })) || [];

  const handleTaskUpdate = (tasks: Task[]) => {
    // Filter only scheduled tasks (those with day and time)
    const scheduled = tasks.filter(task => task.day && task.time);
    setScheduledTasks(scheduled);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('لطفاً عنوان پلی‌لیست را وارد کنید');
      return;
    }

    if (scheduledTasks.length === 0) {
      toast.error('لطفاً حداقل یک رسانه را زمان‌بندی کنید');
      return;
    }

    try {
      // Convert scheduler tasks to API format
      const schedules = scheduledTasks.map(task => {
        // Calculate end time by adding duration to start time
        const startTime = new Date(`2000-01-01T${task.time}`);
        const endTime = new Date(startTime.getTime() + task.duration * 60000);
        const formattedEndTime = endTime.toTimeString().slice(0, 5);

        return {
          attachment: task.id,
          day: DAYS_OF_WEEK.indexOf(task.day),
          start_time: task.time,
          end_time: formattedEndTime,
          translations: [
            {
              title: task.translations?.[0]?.title || task.content,
              description: task.translations?.[0]?.description || '',
              language_code: 'fa'
            },
            {
              title: task.translations?.[1]?.title || task.content,
              description: task.translations?.[1]?.description || '',
              language_code: 'en'
            }
          ]
        };
      });

      const playlistData = {
        title,
        is_active: isActive,
        schedules
      };

      await onSubmit(playlistData);
      
      // Reset form
      setTitle('');
      setIsActive(true);
      setScheduledTasks([]);
    } catch (error: any) {
      toast.error(error?.message || translations.common.error);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error(translations.mediaLibrary.invalidType);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(translations.mediaLibrary.fileTooLarge);
      return;
    }

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = event.dataTransfer.files;
      handleFileChange({ target: input } as any);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-6xl px-4 pt-5 pb-4 overflow-hidden text-right align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={20} />
            </button>
            <h3 className="text-lg font-medium text-gray-900">{translations.playlists.addPlaylist}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                {translations.playlists.playlistTitle}
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ml-2"
                />
                <span className="text-sm text-gray-700">{translations.products.active}</span>
              </label>
            </div>

            {/* Media Upload Zone */}
            <div>
              <div
                className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
                  isUploading
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-300'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*,video/mp4"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <div className="text-center">
                  <Upload className={`mx-auto h-12 w-12 ${isUploading ? 'text-indigo-400' : 'text-gray-400'}`} />
                  <p className="mt-2 text-sm text-gray-500">
                    {translations.mediaLibrary.dragAndDrop}
                  </p>
                  <p className="text-xs text-gray-500">
                    {translations.mediaLibrary.maxSize}
                  </p>
                </div>
              </div>

              {isUploading && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-gray-200 rounded">
                    <div className="h-1 bg-indigo-500 rounded w-full animate-pulse"></div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 text-center">
                    {translations.mediaLibrary.uploading}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4">
              {attachmentsLoading ? (
                <div className="text-center py-4 text-gray-500">
                  {translations.common.loading}
                </div>
              ) : (
                <Scheduler 
                  initialTasks={initialTasks} 
                  onTaskUpdate={handleTaskUpdate}
                  timeRange={{ start: "08:00", end: "18:00" }}
                  columnWidth={100}
                  timeSlotInterval={30}
                />
              )}
            </div>

            <div className="mt-6 space-x-3 space-x-reverse text-left">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {translations.common.cancel}
              </button>
              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {translations.playlists.addPlaylist}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;