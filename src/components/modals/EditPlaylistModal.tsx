import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Playlist, Attachment } from '@/types/api';
import { translations } from '@/lib/constants/translations';
import Scheduler, { DAYS_OF_WEEK } from '@/components/scheduler/Scheduler';
import { Task } from '@/components/scheduler/types';
import { useApiQuery } from '@/hooks';
import { getAttachments, getPlaylist } from '@/lib/api';
import useToast from '@/hooks/useToast';

interface EditPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
  onSubmit: (id: string, data: {
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

const EditPlaylistModal: React.FC<EditPlaylistModalProps> = ({ 
  isOpen, 
  onClose, 
  playlistId,
  onSubmit 
}) => {
  const [title, setTitle] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [scheduledTasks, setScheduledTasks] = useState<Task[]>([]);
  const toast = useToast();

  // Fetch playlist data
  const { data: playlist, isLoading: playlistLoading } = useApiQuery(
    ['playlist', playlistId],
    () => getPlaylist(playlistId),
    {
      enabled: isOpen,
      onSuccess: (data) => {
        setTitle(data.title);
        setIsActive(data.is_active);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || translations.common.error);
        onClose();
      }
    }
  );

  // Fetch media attachments
  const { data: attachments, isLoading: attachmentsLoading } = useApiQuery(
    'attachments',
    getAttachments,
    {
      enabled: isOpen,
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || translations.common.error);
      }
    }
  );

  // Convert attachments to scheduler tasks when playlist and attachments are loaded
  useEffect(() => {
    if (playlist && attachments) {
      const tasks: Task[] = attachments.map((attachment: Attachment) => {
        // Find if this attachment is scheduled in the playlist
        const schedule = playlist.schedules.find(s => s.attachment === attachment.id);
        
        return {
          id: attachment.id,
          content: attachment.title || 'پخش رسانه',
          day: schedule ? DAYS_OF_WEEK[schedule.day] : '',
          time: schedule?.start_time || '',
          duration: attachment.duration ? Math.ceil(attachment.duration * 60) : 60,
          mediaType: attachment.type,
          mediaUrl: attachment.file,
          thumbnail: attachment.thumbnail,
          translations: schedule?.translations || [
            { title: attachment.title || '', description: '', language_code: 'fa' },
            { title: attachment.title || '', description: '', language_code: 'en' }
          ]
        };
      });

      setScheduledTasks(tasks.filter(task => task.day && task.time));
    }
  }, [playlist, attachments]);

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
          translations: task.translations || [
            {
              title: task.content,
              description: '',
              language_code: 'fa'
            },
            {
              title: task.content,
              description: '',
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

      await onSubmit(playlistId, playlistData);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || translations.common.error);
    }
  };

  if (!isOpen) return null;

  const isLoading = playlistLoading || attachmentsLoading;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-6xl px-4 pt-5 pb-4 overflow-hidden text-right align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X size={20} />
            </button>
            <h3 className="text-lg font-medium text-gray-900">ویرایش پلی‌لیست</h3>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{translations.common.loading}</p>
            </div>
          ) : (
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

              <div className="mt-4">
                <Scheduler 
                  initialTasks={attachments?.map((attachment: Attachment) => ({
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
                  }))} 
                  onTaskUpdate={handleTaskUpdate}
                  timeRange={{ start: "00:00", end: "24:00" }}
                  columnWidth={100}
                  timeSlotInterval={60}
                />
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
                  {translations.common.save}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPlaylistModal;