import React, { useState, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useApiQuery, useApiMutation } from '@/hooks';
import { getAttachments, uploadAttachment, deleteAttachment, updateAttachment } from '@/lib/api';
import { Upload, Trash2, Image as ImageIcon, X, Play, Maximize2, Edit2, Check } from 'lucide-react';
import { translations } from '@/lib/constants/translations';
import useToast from '@/hooks/useToast';
import { Attachment } from '@/types/api';

const MediaPage: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<Attachment | null>(null);
  const [editingMedia, setEditingMedia] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
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

  const uploadMutation = useApiMutation(uploadAttachment, {
    onSuccess: () => {
      refetch();
      setIsUploading(false);
      setUploadError(null);
      toast.success(translations.mediaLibrary.uploadSuccess);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setUploadError(translations.mediaLibrary.uploadError);
      setIsUploading(false);
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setUploadError(translations.mediaLibrary.invalidType);
      return;
    }

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } catch (error) {
      console.error('Upload error:', error);
    }
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

    const file = event.dataTransfer.files[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = event.dataTransfer.files;
      handleFileChange({ target: input } as any);
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
    if (attachment.type === 'mp4') {
      return (
        <div className="relative w-full h-full">
          <video
            src={attachment.file}
            className="w-full h-full object-cover"
            preload="metadata"
            muted
            playsInline
          >
            <source src={attachment.file} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
      );
    }

    // For images (png, jpeg)
    return (
      <img
        src={attachment.file}
        alt={attachment.title || ''}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    );
  };

  const renderPreviewModal = () => {
    if (!previewMedia) return null;

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
                src={previewMedia.file}
                className="max-w-full max-h-[90vh] object-contain"
                controls
                autoPlay
              >
                <source src={previewMedia.file} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={previewMedia.file}
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
            <div className="mt-4">
              <div className="h-1 w-full bg-gray-200 rounded">
                <div className="h-1 bg-indigo-500 rounded w-full animate-pulse"></div>
              </div>
              <p className="mt-2 text-sm text-gray-500 text-center">
                {translations.mediaLibrary.uploading}
              </p>
            </div>
          )}

          {uploadError && (
            <div className="mt-2 text-sm text-red-600 text-center">
              {uploadError}
            </div>
          )}
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
          ) : attachments && attachments.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {attachments.map((attachment) => (
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
      </div>
    </MainLayout>
  );
};

export default MediaPage;