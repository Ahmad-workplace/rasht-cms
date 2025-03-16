import React, { useState } from 'react';
import { Image, Upload, X } from 'lucide-react';
import { useApiQuery, useApiMutation } from '@/hooks';
import { getAttachments, uploadAttachment } from '@/lib/api';
import { Attachment } from '@/types/api';
import { translations } from '@/lib/constants/translations';

interface MediaPickerProps {
  value?: string[];
  onChange: (attachments: Attachment[]) => void;
  onClose?: () => void;
  multiple?: boolean;
}

const MediaPicker: React.FC<MediaPickerProps> = ({ value = [], onChange, onClose, multiple = true }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(value);

  const { data: attachments, isLoading, refetch } = useApiQuery(
    'attachments',
    getAttachments,
    {
      staleTime: 0,
      cacheTime: 0,
    }
  );

  const uploadMutation = useApiMutation(uploadAttachment, {
    onSuccess: (data) => {
      // Update the selected IDs with the newly uploaded file
      const newIds = multiple ? [...selectedIds, data.id] : [data.id];
      setSelectedIds(newIds);
      
      // Get the full attachment objects for the selected IDs
      const selectedAttachments = attachments?.filter(a => newIds.includes(a.id)) || [];
      if (data) {
        selectedAttachments.push(data);
      }
      onChange(selectedAttachments);
      
      // Refetch the attachments list to include the new upload
      refetch();
      setIsUploading(false);
      setUploadError(null);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setUploadError('خطا در آپلود فایل');
      setIsUploading(false);
    }
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    // Reset previous error
    setUploadError(null);

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('فقط فایل‌های تصویری مجاز هستند');
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('حداکثر حجم فایل ۵ مگابایت است');
        continue;
      }

      setIsUploading(true);
      try {
        await uploadMutation.mutateAsync(file);
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
  };

  const handleSelect = (attachment: Attachment) => {
    let newIds: string[];
    if (multiple) {
      // Toggle selection for multiple mode
      newIds = selectedIds.includes(attachment.id)
        ? selectedIds.filter(id => id !== attachment.id)
        : [...selectedIds, attachment.id];
    } else {
      // Single selection mode
      newIds = [attachment.id];
    }
    setSelectedIds(newIds);
    
    // Get the full attachment objects for the selected IDs
    const selectedAttachments = attachments?.filter(a => newIds.includes(a.id)) || [];
    onChange(selectedAttachments);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length) {
      const input = document.createElement('input');
      input.type = 'file';
      input.files = files;
      handleFileChange({ target: input } as any);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {translations.mediaLibrary.title}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Upload Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {translations.mediaLibrary.uploadNew}
        </label>
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
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
            multiple={multiple}
          />
          <div className="text-center">
            <Upload className={`mx-auto h-12 w-12 ${isUploading ? 'text-indigo-400' : 'text-gray-400'}`} />
            <p className="mt-1 text-sm text-gray-500">
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
        {uploadError && (
          <p className="mt-2 text-sm text-red-600">{uploadError}</p>
        )}
      </div>

      {/* Media Library Grid */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {translations.mediaLibrary.existingMedia}
        </h4>
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">
            {translations.common.loading}
          </div>
        ) : attachments && attachments.length > 0 ? (
          <div className="grid grid-cols-4 gap-4 max-h-60 overflow-y-auto p-1">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                onClick={() => handleSelect(attachment)}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${
                  selectedIds.includes(attachment.id)
                    ? 'border-indigo-500 ring-2 ring-indigo-200'
                    : 'border-transparent hover:border-indigo-300'
                } transition-all duration-200 transform hover:scale-105`}
              >
                {attachment.file ? (
                  <img
                    src={attachment.file}
                    alt={attachment.title || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                {selectedIds.includes(attachment.id) && (
                  <div className="absolute inset-0 bg-indigo-500 bg-opacity-10" />
                )}
                {attachment.type && (
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs bg-black bg-opacity-50 text-white rounded">
                    {attachment.type}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            {translations.mediaLibrary.noMedia}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPicker;