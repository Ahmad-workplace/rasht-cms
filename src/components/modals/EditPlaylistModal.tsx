import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Calendar, Clock, Video, Image, Save, ChevronDown, ChevronRight, X, Edit2, Globe, Languages, ChevronUp } from 'lucide-react';
import { useApiQuery, useApiMutation } from '@/hooks';
import { getPlaylistDetails, getAttachments } from '@/lib/api';
import type { PlaylistDetail, Attachment, Schedule, Translation } from '@/types/api';

interface EditPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
  onSubmit: (id: string, data: Partial<PlaylistDetail>) => void;
}

const EditPlaylistModal: React.FC<EditPlaylistModalProps> = ({
  isOpen,
  onClose,
  playlistId,
  onSubmit
}) => {
  const [draftPlaylist, setDraftPlaylist] = useState<PlaylistDetail | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTranslations, setEditingTranslations] = useState<string | null>(null);
  const [expandedMedia, setExpandedMedia] = useState<Set<string>>(new Set());

  const { data: selectedPlaylist } = useApiQuery(
    ['playlist', playlistId],
    () => getPlaylistDetails(playlistId),
    {
      enabled: isOpen,
      staleTime: 30000,
      cacheTime: 60000,
    }
  );

  const { data: attachments = [] } = useApiQuery(
    'attachments',
    getAttachments,
    {
      enabled: isOpen,
      staleTime: 30000,
      cacheTime: 60000,
    }
  );

  useEffect(() => {
    if (selectedPlaylist) {
      const formattedPlaylist = {
        ...selectedPlaylist,
        schedules: selectedPlaylist.schedules.map(schedule => ({
          ...schedule,
          start_time: schedule.start_time.slice(0, 5),
          end_time: schedule.end_time.slice(0, 5)
        }))
      };
      setDraftPlaylist(formattedPlaylist);
    }
  }, [selectedPlaylist]);

  useEffect(() => {
    if (!isOpen) {
      setUnsavedChanges(false);
      setExpandedDay(null);
      setEditingTranslations(null);
      setExpandedMedia(new Set());
    }
  }, [isOpen]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: any) => {
    setIsDragging(false);
    if (!result.destination || !draftPlaylist) return;

    const { source, destination } = result;
    
    if (source.droppableId === 'attachments' && destination.droppableId.startsWith('day-')) {
      const day = parseInt(destination.droppableId.split('-')[1]);
      const attachment = attachments[source.index];
      
      const newSchedule: Schedule = {
        id: `temp-${Date.now()}`,
        attachment,
        day,
        start_time: '00:00',
        end_time: '23:59',
        translations: [
          { language_code: 'fa', title: '', description: '' },
          { language_code: 'en', title: '', description: '' }
        ]
      };

      const daySchedules = draftPlaylist.schedules.filter(s => s.day === day);
      
      const updatedSchedules = [...draftPlaylist.schedules];
      const insertIndex = updatedSchedules.findIndex(s => s.day === day) + (destination.index || daySchedules.length);
      
      if (insertIndex === -1) {
        updatedSchedules.push(newSchedule);
      } else {
        updatedSchedules.splice(insertIndex, 0, newSchedule);
      }

      setDraftPlaylist({ ...draftPlaylist, schedules: updatedSchedules });
      setUnsavedChanges(true);
      setEditingTranslations(`${newSchedule.id}-fa`);
      setExpandedMedia(new Set([...expandedMedia, newSchedule.id]));
    }
  };

  const handleDragOver = (event: any) => {
    const droppableId = event?.destination?.droppableId;
    if (droppableId && droppableId.startsWith('day-')) {
      const day = parseInt(droppableId.split('-')[1]);
      setExpandedDay(day);
    }
  };

  const handleTranslationChange = (
    scheduleId: string,
    languageCode: string,
    field: keyof Translation,
    value: string
  ) => {
    if (!draftPlaylist) return;

    const updatedSchedules = draftPlaylist.schedules.map(schedule => {
      if (schedule.id === scheduleId) {
        const updatedTranslations = schedule.translations.map(translation => {
          if (translation.language_code === languageCode) {
            return { ...translation, [field]: value };
          }
          return translation;
        });

        if (!updatedTranslations.some(t => t.language_code === languageCode)) {
          updatedTranslations.push({
            language_code: languageCode,
            title: field === 'title' ? value : '',
            description: field === 'description' ? value : ''
          });
        }

        return { ...schedule, translations: updatedTranslations };
      }
      return schedule;
    });

    setDraftPlaylist({ ...draftPlaylist, schedules: updatedSchedules });
    setUnsavedChanges(true);
  };

  const handleTimeChange = (scheduleId: string, field: 'start_time' | 'end_time', value: string) => {
    if (!draftPlaylist) return;

    const updatedSchedules = draftPlaylist.schedules.map(schedule => {
      if (schedule.id === scheduleId) {
        return { ...schedule, [field]: value };
      }
      return schedule;
    });

    setDraftPlaylist({ ...draftPlaylist, schedules: updatedSchedules });
    setUnsavedChanges(true);
  };

  const handleRemoveSchedule = (scheduleId: string) => {
    if (!draftPlaylist) return;

    const updatedSchedules = draftPlaylist.schedules.filter(s => s.id !== scheduleId);
    setDraftPlaylist({ ...draftPlaylist, schedules: updatedSchedules });
    setUnsavedChanges(true);
    setExpandedMedia(prev => {
      const next = new Set(prev);
      next.delete(scheduleId);
      return next;
    });
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!draftPlaylist) return;
    setDraftPlaylist({ ...draftPlaylist, title: event.target.value });
    setUnsavedChanges(true);
  };

  const handleActiveToggle = () => {
    if (!draftPlaylist) return;
    setDraftPlaylist({ ...draftPlaylist, is_active: !draftPlaylist.is_active });
    setUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!draftPlaylist || !playlistId) return;

    try {
      const playlistToSave = {
        ...draftPlaylist,
        schedules: draftPlaylist.schedules.map(schedule => ({
          ...schedule,
          start_time: `${schedule.start_time}:00`,
          end_time: `${schedule.end_time}:00`
        }))
      };

      await onSubmit(playlistId, playlistToSave);
      setUnsavedChanges(false);
      toast.success('تغییرات با موفقیت ذخیره شد');
      onClose();
    } catch (error) {
      toast.error('ذخیره تغییرات با خطا مواجه شد');
    }
  };

  const handleCancelEditing = () => {
    setDraftPlaylist(selectedPlaylist);
    setIsEditingTitle(false);
    setUnsavedChanges(false);
    setExpandedDay(null);
    setEditingTranslations(null);
    setExpandedMedia(new Set());
    onClose();
  };

  const toggleMediaExpanded = (scheduleId: string) => {
    setExpandedMedia(prev => {
      const next = new Set(prev);
      if (next.has(scheduleId)) {
        next.delete(scheduleId);
      } else {
        next.add(scheduleId);
      }
      return next;
    });
  };

  const getDayName = (day: number) => {
    const days = ['پنج‌شنبه', 'جمعه', 'شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'];
    return days[(day + 2) % 7];
  };

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const getTranslation = (translations: Translation[], languageCode: string) => {
    return translations.find(t => t.language_code === languageCode) || {
      language_code: languageCode,
      title: '',
      description: ''
    };
  };

  const renderAttachmentsList = () => (
    <div className="top-0 left-0 w-48 bg-white shadow-lg h-screen border-r">
      <div className="p-1.5 h-full overflow-y-auto">
        <h2 className="text-base font-semibold mb-1.5 sticky top-0 bg-white pb-1.5 border-b">رسانه‌های موجود</h2>
        <Droppable droppableId="attachments" type="ATTACHMENT">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-1.5"
            >
              {attachments.map((attachment, index) => (
                <Draggable
                  key={attachment.id}
                  draggableId={attachment.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`border rounded p-1.5 cursor-move hover:shadow-md transition-shadow bg-white ${
                        snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          {attachment.type === 'mp4' ? (
                            <Video className="w-5 h-5 text-gray-400" />
                          ) : (
                            attachment.file ? (
                              <img
                                src={attachment.file}
                                alt="رسانه"
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Image className="w-5 h-5 text-gray-400" />
                            )
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{attachment.title || 'بدون عنوان'}</p>
                          <p className="text-xs text-gray-500">نوع: {attachment.type}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );

  if (!isOpen || !draftPlaylist) return null;

  const schedulesByDay = draftPlaylist.schedules.reduce((acc, schedule) => {
    const day = schedule.day;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {} as Record<number, typeof draftPlaylist.schedules>);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCancelEditing} />

        <div className="inline-block w-full max-w-6xl px-4 pt-5 pb-4 overflow-hidden text-right align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragUpdate={handleDragOver}>
            <div className="flex">
              <div className="flex-1 px-1.5 py-3">
                <div className="flex items-center gap-1.5 mb-3">
                  {isEditingTitle ? (
                    <input
                      type="text"
                      value={draftPlaylist.title}
                      onChange={handleTitleChange}
                      className="text-lg font-bold border rounded px-1"
                      autoFocus
                      onBlur={() => setIsEditingTitle(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                    />
                  ) : (
                    <div className="flex items-center gap-1">
                      <h1 className="text-lg font-bold">{draftPlaylist.title}</h1>
                      <button
                        onClick={() => setIsEditingTitle(true)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={handleActiveToggle}
                    className={`px-1.5 py-0.5 rounded-full text-xs ${
                      draftPlaylist.is_active
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {draftPlaylist.is_active ? 'فعال' : 'غیرفعال'}
                  </button>
                  <div className="mr-auto flex items-center gap-1.5">
                    <button
                      onClick={handleCancelEditing}
                      className="px-2 py-1 rounded bg-gray-200 text-xs hover:bg-gray-300"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={!unsavedChanges}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-3 h-3" />
                      ذخیره تغییرات
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <Droppable droppableId={`day-${day}`} key={day} type="ATTACHMENT">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`bg-white rounded shadow-sm border-2 ${
                            snapshot.isDraggingOver 
                              ? 'border-blue-500 bg-blue-50' 
                              : isDragging 
                                ? 'border-dashed border-gray-300 bg-gray-50'
                                : 'border-transparent'
                          } transition-all duration-200`}
                        >
                          <button
                            onClick={() => toggleDay(day)}
                            className={`w-full px-4 py-3 text-right flex items-center justify-between hover:bg-gray-50 ${
                              isDragging ? 'cursor-copy' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <h2 className="text-sm font-semibold">
                                {getDayName(day)}
                              </h2>
                              <span className="text-xs text-gray-500">
                                ({schedulesByDay[day]?.length || 0} مورد)
                              </span>
                            </div>
                            {expandedDay === day ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          
                          {(expandedDay === day || snapshot.isDraggingOver) && (
                            <div className={`p-3 border-t ${
                              snapshot.isDraggingOver ? 'bg-blue-50' : ''
                            }`}>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                                {schedulesByDay[day]?.map((schedule, index) => (
                                  <div key={schedule.id} className="border rounded p-1.5 bg-white">
                                    <div className="flex gap-1.5 mb-1.5">
                                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                        {schedule.attachment.type === 'mp4' ? (
                                          <Video className="w-6 h-6 text-gray-400" />
                                        ) : (
                                          schedule.attachment.file ? (
                                            <img
                                              src={schedule.attachment.file}
                                              alt="برنامه"
                                              className="w-full h-full object-cover rounded"
                                            />
                                          ) : (
                                            <Image className="w-6 h-6 text-gray-400" />
                                          )
                                        )}
                                      </div>
                                      <div className="flex-grow min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center gap-1 min-w-0">
                                            <Clock className="w-3 h-3 text-gray-600 flex-shrink-0" />
                                            <div className="flex gap-1 items-center text-xs">
                                              <input
                                                type="time"
                                                value={schedule.start_time}
                                                onChange={(e) => handleTimeChange(schedule.id, 'start_time', e.target.value)}
                                                className="border rounded px-1 py-0.5 w-20"
                                              />
                                              <span>تا</span>
                                              <input
                                                type="time"
                                                value={schedule.end_time}
                                                onChange={(e) => handleTimeChange(schedule.id, 'end_time', e.target.value)}
                                                className="border rounded px-1 py-0.5 w-20"
                                              />
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => toggleMediaExpanded(schedule.id)}
                                              className="text-gray-400 hover:text-gray-600"
                                            >
                                              {expandedMedia.has(schedule.id) ? (
                                                <ChevronUp className="w-3 h-3" />
                                              ) : (
                                                <ChevronDown className="w-3 h-3" />
                                              )}
                                            </button>
                                            <button
                                              onClick={() => handleRemoveSchedule(schedule.id)}
                                              className="text-red-600 hover:text-red-800 p-0.5"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                        <p className="text-xs text-gray-500">نوع: {schedule.attachment.type}</p>
                                      </div>
                                    </div>
                                    
                                    {expandedMedia.has(schedule.id) && (
                                      <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <Globe className="w-3 h-3 text-gray-400" />
                                          <span className="text-xs font-medium">ترجمه‌ها</span>
                                        </div>
                                        {['fa', 'en'].map(lang => {
                                          const translation = getTranslation(schedule.translations, lang);
                                          const isEditing = editingTranslations === `${schedule.id}-${lang}`;
                                          
                                          return (
                                            <div key={lang} className="border rounded p-1.5">
                                              <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-1">
                                                  <Languages className="w-3 h-3 text-gray-400" />
                                                  <span className="text-xs font-medium">
                                                    {lang === 'fa' ? 'فارسی' : 'English'}
                                                  </span>
                                                </div>
                                                <button
                                                  onClick={() => setEditingTranslations(isEditing ? null : `${schedule.id}-${lang}`)}
                                                  className="text-gray-400 hover:text-gray-600"
                                                >
                                                  <Edit2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                              {isEditing ? (
                                                <div className="space-y-1">
                                                  <input
                                                    type="text"
                                                    value={translation.title || ''}
                                                    onChange={(e) => handleTranslationChange(schedule.id, lang, 'title', e.target.value)}
                                                    placeholder="عنوان"
                                                    className="w-full text-xs border rounded px-1.5 py-1"
                                                  />
                                                  <textarea
                                                    value={translation.description || ''}
                                                    onChange={(e) => handleTranslationChange(schedule.id, lang, 'description', e.target.value)}
                                                    placeholder="توضیحات"
                                                    className="w-full text-xs border rounded px-1.5 py-1 h-20 resize-none"
                                                  />
                                                </div>
                                              ) : (
                                                <div>
                                                  <p className="text-xs truncate">
                                                    {translation.title || 'بدون عنوان'}
                                                  </p>
                                                  <p className="text-xs text-gray-500 line-clamp-2">
                                                    {translation.description || 'بدون توضیحات'}
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {provided.placeholder}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  ))}
                </div>
              </div>
              {renderAttachmentsList()}
            </div>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

export default EditPlaylistModal;