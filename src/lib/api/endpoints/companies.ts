import { 
  Company, 
  CompanyContact, 
  CompanyLicense, 
  CompanyRequest,
  PaginatedResponse
} from '@/types/api';
import apiClient from '@/lib/api/client';

/**
 * Get paginated companies list
 */
export const getCompanies = async (page = 1, pageSize = 10, name?: string): Promise<PaginatedResponse<Company>> => {
  const params: Record<string, any> = { 
    page, 
    page_size: pageSize 
  };

  if (name) {
    params.name = name;
  }

  const response = await apiClient.get<PaginatedResponse<Company>>('/companies/company/', {
    params
  });
  return response.data;
};

/**
 * Get company by ID
 */
export const getCompany = async (id: string): Promise<Company> => {
  const response = await apiClient.get<Company>(`/companies/companies/${id}/`);
  return response.data;
};

/**
 * Create new company
 */
export const createCompany = async (companyData: Omit<Company, 'id'>): Promise<Company> => {
  const response = await apiClient.post<Company>('/companies/company/', companyData);
  return response.data;
};

/**
 * Update company
 */
export const updateCompany = async (id: string, companyData: Partial<Company>): Promise<Company> => {
  const response = await apiClient.patch<Company>(`/companies/companies/${id}/`, companyData);
  return response.data;
};

/**
 * Delete company
 */
export const deleteCompany = async (id: string): Promise<void> => {
  await apiClient.delete(`/companies/company/${id}/`);
};

/**
 * Get company contact details
 */
export const getCompanyContact = async (companyId: string): Promise<CompanyContact> => {
  const response = await apiClient.get<CompanyContact>(`/companies/companies/${companyId}/contact_detail/`);
  return response.data;
};

/**
 * Create company contact
 */
export const createCompanyContact = async (contactData: Omit<CompanyContact, 'id'>): Promise<CompanyContact> => {
  const response = await apiClient.post<CompanyContact>('/companies/companies/contacts/', contactData);
  return response.data;
};

/**
 * Update company contact
 */
export const updateCompanyContact = async (id: string, contactData: Partial<CompanyContact>): Promise<CompanyContact> => {
  const response = await apiClient.patch<CompanyContact>(`/companies/contacts/${id}/`, contactData);
  return response.data;
};

/**
 * Get company license details
 */
export const getCompanyLicense = async (companyId: string): Promise<CompanyLicense> => {
  const response = await apiClient.get<CompanyLicense>(`/companies/${companyId}/license_detail/`);
  return response.data;
};

/**
 * Create company license
 */
export const createCompanyLicense = async (licenseData: Omit<CompanyLicense, 'id'>): Promise<CompanyLicense> => {
  const response = await apiClient.post<CompanyLicense>('/companies/licenses/', licenseData);
  return response.data;
};

/**
 * Update company license
 */
export const updateCompanyLicense = async (id: string, licenseData: Partial<CompanyLicense>): Promise<CompanyLicense> => {
  const response = await apiClient.patch<CompanyLicense>(`/companies/licenses/${id}/`, licenseData);
  return response.data;
};

/**
 * Get company requests
 */
export const getCompanyRequests = async (): Promise<CompanyRequest[]> => {
  const response = await apiClient.get<CompanyRequest[]>('/companies/req/');
  return response.data;
};

/**
 * Create company request
 */
export const createCompanyRequest = async (requestData: Omit<CompanyRequest, 'id' | 'status'>): Promise<CompanyRequest> => {
  const response = await apiClient.post<CompanyRequest>('/companies/req/', requestData);
  return response.data;
};