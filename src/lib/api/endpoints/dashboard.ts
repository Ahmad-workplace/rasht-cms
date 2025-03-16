import { AboutUs, AboutUsPut, ContactUs, Device, MainAppAboutUs2 } from "@/types/dashboard.type";
import { apiClient } from "..";

/**
 * Get about us information
 */
export const getAboutUs = async (): Promise<MainAppAboutUs2> => {
  const response = await apiClient.get<MainAppAboutUs2>("/dashboard/about/get/");
  return response.data;
};

/**
 * Update about us information
 */
export const updateAboutUs = async (data: AboutUsPut): Promise<AboutUsPut> => {
  const response = await apiClient.put<AboutUsPut>("/dashboard/about/put/", data);
  return response.data;
};

/**
 * Retrieve about us information
 */
export const retrieveAboutUs = async (): Promise<AboutUs[]> => {
  const response = await apiClient.get<AboutUs[]>(
    "/dashboard/about/retrievee/"
  );
  return response.data;
};

/**
 * Update contact us information
 */
export const updateContactUs = async (data: ContactUs): Promise<ContactUs> => {
  const response = await apiClient.put<ContactUs>(
    "/dashboard/contact/put/",
    data
  );
  return response.data;
};

/**
 * Retrieve contact us information
 */
export const retrieveContactUs = async (): Promise<ContactUs> => {
  const response = await apiClient.get<ContactUs>(
    "/dashboard/contact/retrievee/"
  );
  return response.data;
};

/**
 * Get list of devices
 */
export const getDevices = async (): Promise<Device[]> => {
  const response = await apiClient.get<Device[]>("/dashboard/devices/");
  return response.data;
};

/**
 * Create a new device
 */
export const createDevice = async (data: Device): Promise<Device> => {
  const response = await apiClient.post<Device>("/dashboard/devices/", data);
  return response.data;
};

/**
 * Get device by ID
 */
export const getDevice = async (id: string): Promise<Device> => {
  const response = await apiClient.get<Device>(`/dashboard/devices/${id}/`);
  return response.data;
};

/**
 * Update device by ID
 */
export const updateDevice = async (
  id: string,
  data: Device
): Promise<Device> => {
  const response = await apiClient.put<Device>(
    `/dashboard/devices/${id}/`,
    data
  );
  return response.data;
};

/**
 * Partially update device by ID
 */
export const partialUpdateDevice = async (
  id: string,
  data: Partial<Device>
): Promise<Device> => {
  const response = await apiClient.patch<Device>(
    `/dashboard/devices/${id}/`,
    data
  );
  return response.data;
};
