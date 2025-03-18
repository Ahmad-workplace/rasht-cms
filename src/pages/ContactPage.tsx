import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useApiQuery, useApiMutation } from '@/hooks';
import { retrieveContactUs, updateContactUs } from '@/lib/api/endpoints/dashboard';
import useToast from '@/hooks/useToast';
import { ContactUs } from '@/types/dashboard.type';

const ContactPage: React.FC = () => {
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [number, setNumber] = useState('');
  const [social_media, setSocialMedia] = useState<Record<string, string>>({}); // Align with the interface
  const [website, setWebsite] = useState('');

  // Fetch contact information
  const { data: contactData, isLoading, isError } = useApiQuery(
    ['retrieveContactUs'],
    () => retrieveContactUs()
  );

  // Mutation for updating contact information
  const { mutate: updateContact } = useApiMutation(
    (data: ContactUs) => updateContactUs(data),
    {
      onSuccess: () => {
        toast.success('Contact information updated successfully');
        setIsEditing(false);
      },
      onError: () => {
        toast.error('Failed to update contact information');
      },
    }
  );

  useEffect(() => {
    if (contactData) {
      setNumber(contactData.number);
      setSocialMedia(contactData.social_media || {}); // Align with the interface
      setWebsite(contactData.website);
    }
  }, [contactData]);

  const handleSave = () => {
    const updatedData: ContactUs = {
      number,
      social_media, // Align with the interface
      website,
    };
    updateContact(updatedData);
  };

  const handleSocialMediaChange = (platform: string, url: string) => {
    setSocialMedia((prev) => ({
      ...prev,
      [platform]: url,
    }));
  };

  const handleAddSocialMedia = () => {
    const newPlatform = prompt('Enter the name of the social media platform (e.g., Facebook, Twitter):');
    if (newPlatform) {
      setSocialMedia((prev) => ({
        ...prev,
        [newPlatform]: '',
      }));
    }
  };

  const handleRemoveSocialMedia = (platform: string) => {
    setSocialMedia((prev) => {
      const updatedSocialMedia = { ...prev };
      delete updatedSocialMedia[platform];
      return updatedSocialMedia;
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching contact information</div>;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-6">اطلاعات تماس</h1>

        {/* Number Input */}
        <div className="flex items-center mb-4">
          <label className="w-32">Number:</label>
          {isEditing ? (
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
          ) : (
            <span className="flex-1 px-3 py-2">{number}</span>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            ویرایش
          </button>
        </div>

        {/* Social Media Input */}
        <div className="mb-4">
          <label className="block mb-2">Social Media:</label>
          {isEditing ? (
            <div>
              {Object.entries(social_media).map(([platform, url]) => (
                <div key={platform} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={platform}
                    disabled
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md mr-2"
                  />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md mr-2"
                  />
                  <button
                    onClick={() => handleRemoveSocialMedia(platform)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddSocialMedia}
                className="px-4 py-2 bg-green-500 text-white rounded-md"
              >
                Add Social Media
              </button>
            </div>
          ) : (
            <div>
              {Object.entries(social_media).map(([platform, url]) => (
                <div key={platform} className="flex items-center mb-2">
                  <span className="w-32 font-medium">{platform}:</span>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {url}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Website Input */}
        <div className="flex items-center mb-4">
          <label className="w-32">Website:</label>
          {isEditing ? (
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
          ) : (
            <span className="flex-1 px-3 py-2">{website}</span>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            ویرایش
          </button>
        </div>

        {/* Save Button (Visible only in edit mode) */}
        {isEditing && (
          <div className="mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-500 text-white rounded-md"
            >
              ذخیره
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ContactPage;