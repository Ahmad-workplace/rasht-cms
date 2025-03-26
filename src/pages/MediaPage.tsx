import React, { useState, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useApiQuery, useApiMutation } from '@/hooks';
import { getAttachments, uploadAttachment, deleteAttachment, updateAttachment } from '@/lib/api';
import { Upload, Trash2, Image as ImageIcon, X, Play, Maximize2, Edit2, Check, Search } from 'lucide-react';
import { translations } from '@/lib/constants/translations';
import useToast from '@/hooks/useToast';
import { Attachment } from '@/types/api';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

const MediaPage: React.FC = () => {
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<Attachment | null>(null);
  const [editingMedia, setEditingMedia] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const { data: attachments, isLoading, error, refetch } = useApiQuery(
    'attachments',
    getAttachments,
    {
      staleTime: 0,
      cacheTime: 0,
    }
  );

  // Filter attachments based on search title
  const filteredAttachments = attachments?.filter(attachment => {
    if (!searchTitle) return true;
    return attachment.title?.toLowerCase().includes(searchTitle.toLowerCase());
  });

  const uploadMutation = useApiMutation(uploadAttachment, {
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setUploadError(translations.mediaLibrary.uploadError);
    }
  });

  const updateMutation = useApiMutation(
    ({ id, data }: { id: string; data: Partial<Attachment> }) => updateAttachment(id, data),
    {
      onSuccess: () => {
        refetch();
        setEditingMedia(null);
        toast.success('رسانه با موفقیت ویرایش شد');
      },
      onError: (error) => {
        toast.error('خطا در ویرایش رسانه');
        console.error('Update error:', error);
      }
    }
  );

  const deleteMutation = useApiMutation(deleteAttachment, {
    onSuccess: () => {
      refetch();
      toast.success(translations.mediaLibrary.deleteSuccess);
    }
  });

  const processUploadQueue = async () => {
    if (!uploadQueue.length || isUploading) return;

    setIsUploading(true);
    const currentQueue = [...uploadQueue];
    
    for (let i = 0; i < currentQueue.length; i++) {
      const item = currentQueue[i];
      if (item.status !== 'pending') continue;

      try {
        // Update status to uploading
        setUploadQueue(prev => prev.map(qItem => 
          qItem.id === item.id ? { ...qItem, status: 'uploading' } : qItem
        ));

        // Create FormData and upload
        await uploadMutation.mutateAsync(item.file);

        // Update status to completed
        setUploadQueue(prev => prev.map(qItem => 
          qItem.id === item.id ? { ...qItem, status: 'completed', progress: 100 } : qItem
        ));

        // Simulate progress updates
        const updateProgress = (progress: number) => {
          setUploadQueue(prev => prev.map(qItem => 
            qItem.id === item.id ? { ...qItem, progress } : qItem
          ));
        };

        for (let progress = 0; progress <= 100; progress += 10) {
          updateProgress(progress);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error('Upload error:', error);
        setUploadQueue(prev => prev.map(qItem => 
          qItem.id === item.id ? { ...qItem, status: 'error', error: 'Upload failed' } : qItem
        ));
      }
    }

    // Clean up completed uploads after a delay
    setTimeout(() => {
      setUploadQueue(prev => prev.filter(item => item.status !== 'completed'));
    }, 3000);

    setIsUploading(false);
  };

  // Start processing queue when items are added
  React.useEffect(() => {
    if (uploadQueue.length > 0 && !isUploading) {
      processUploadQueue();
    }
  }, [uploadQueue]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setUploadError(null);

    // Create upload items for each file
    const newUploadItems: UploadItem[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(2),
      file,
      progress: 0,
      status: 'pending'
    }));

    // Add to queue
    setUploadQueue(prev => [...prev, ...newUploadItems]);
  };

  const handleUpdateMedia = async (id: string, title: string) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { title }
      });
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(translations.mediaLibrary.deleteConfirm)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files?.length) {
      // Create upload items for each dropped file
      const newUploadItems: UploadItem[] = Array.from(files).map(file => ({
        id: Math.random().toString(36).substring(2),
        file,
        progress: 0,
        status: 'pending'
      }));

      // Add to queue
      setUploadQueue(prev => [...prev, ...newUploadItems]);
    }
  };

  const startEditing = (attachment: Attachment) => {
    setEditingMedia(attachment.id);
    setEditTitle(attachment.title || '');
  };

  const handleSubmitEdit = (id: string) => {
    handleUpdateMedia(id, editTitle);
  };

  const renderMediaItem = (attachment: Attachment) => {
    // Get the correct URL from either file or file_url field
    const mediaUrl = attachment.file || attachment.file_url;
    
    if (!mediaUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      );
    }

    if (attachment.type === 'mp4') {
      return (
        <div className="relative w-full h-full">
          <video
            src={mediaUrl}
            className="w-full h-full object-cover"
            preload="metadata"
            muted
            playsInline
          >
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
      );
    }

    // For images (png, jpeg, jpg, webp, gif)
    return (
      <img
        src={mediaUrl}
        alt={attachment.title || ''}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    );
  };

  const renderUploadQueue = () => {
    if (!uploadQueue.length) return null;

    return (
      <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-3 bg-gray-50 border-b">
          <h3 className="text-sm font-medium">در حال آپلود ({uploadQueue.length} فایل)</h3>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {uploadQueue.map((item) => (
            <div key={item.id} className="p-3 border-b last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm truncate">{item.file.name}</span>
                {item.status === 'error' && (
                  <button
                    onClick={() => setUploadQueue(prev => prev.filter(i => i.id !== item.id))}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    item.status === 'error'
                      ? 'bg-red-500'
                      : item.status === 'completed'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              {item.status === 'error' && (
                <p className="text-xs text-red-500 mt-1">{item.error}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPreviewModal = () => {
    if (!previewMedia) return null;

    const mediaUrl = previewMedia.file || previewMedia.file_url;
    if (!mediaUrl) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
        <div className="relative max-w-6xl w-full max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
            <h3 className="text-lg font-medium text-white">
              {previewMedia.title || 'پیش‌نمایش رسانه'}
            </h3>
            <button
              onClick={() => setPreviewMedia(null)}
              className="text-white hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            {previewMedia.type === 'mp4' ? (
              <video
                src={mediaUrl}
                className="max-w-full max-h-[90vh] object-contain"
                controls
                autoPlay
              >
                <source src={mediaUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={mediaUrl}
                alt={previewMedia.title || ''}
                className="max-w-full max-h-[90vh] object-contain"
              />
            )}
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center p-4 bg-gradient-to-t from-black/50 to-transparent">
            <div className="text-white">
              <p className="text-sm font-medium">{previewMedia.type.toUpperCase()}</p>
              {previewMedia.duration && (
                <p className="text-sm">مدت: {Math.round(previewMedia.duration)} ثانیه</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">{translations.mediaLibrary.title}</h1>

        {/* Upload Section */}
        <div className="mt-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
              isUploading
                ? 'border-indigo-300 bg-indigo-50'
                : 'border-gray-300 hover:border-indigo-300'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/mp4"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
              multiple
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

          {uploadError && (
            <div className="mt-2 text-sm text-red-600 text-center">
              {uploadError}
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="جستجو بر اساس عنوان..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {translations.mediaLibrary.existingMedia}
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{translations.common.loading}</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{translations.common.error}</p>
            </div>
          ) : filteredAttachments && filteredAttachments.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredAttachments.map((attachment) => (
                <div key={attachment.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {renderMediaItem(attachment)}

                  {/* Title */}
                  <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/50 to-transparent">
                    <p className="text-xs text-white truncate">
                      {attachment.title || 'بدون عنوان'}
                    </p>
                  </div>

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {editingMedia === attachment.id ? (
                      <div className="w-full px-3">
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm rounded bg-white/90 border-none focus:ring-2 focus:ring-blue-500"
                            placeholder="عنوان رسانه"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSubmitEdit(attachment.id)}
                            className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewMedia(attachment)}
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-gray-900 transition-colors"
                          title="پیش‌نمایش"
                        >
                          <Maximize2 size={16} />
                        </button>
                        <button
                          onClick={() => startEditing(attachment)}
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-gray-900 transition-colors"
                          title="ویرایش"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(attachment.id)}
                          className="p-2 bg-white rounded-full text-red-600 hover:text-red-700 transition-colors"
                          title={translations.common.delete}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                    <div className="flex items-center justify-between text-white text-xs">
                      <span className="uppercase">{attachment.type}</span>
                      {attachment.duration && (
                        <span>{Math.round(attachment.duration)}s</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {translations.mediaLibrary.noMedia}
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {renderPreviewModal()}

        {/* Upload Queue */}
        {renderUploadQueue()}
      </div>
    </MainLayout>
  );
};

export default MediaPage;