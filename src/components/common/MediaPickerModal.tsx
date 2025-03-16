import React from 'react';
import { Attachment } from '@/types/api';
import MediaPicker from './MediaPicker';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  value?: string[];
  onChange: (attachments: Attachment[]) => void;
  multiple?: boolean;
}

const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  value,
  onChange,
  multiple = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-3xl px-4 pt-5 pb-4 overflow-hidden text-right align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <MediaPicker
            value={value}
            onChange={onChange}
            onClose={onClose}
            multiple={multiple}
          />
        </div>
      </div>
    </div>
  );
};

export default MediaPickerModal;