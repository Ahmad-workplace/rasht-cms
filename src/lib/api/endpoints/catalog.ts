import { 
  Category,
  Product,
  CreateProduct,
  PaginatedResponse
} from '@/types/api';
import apiClient from '@/lib/api/client';

/**
 * Get categories list
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>('/catalog/categories/');
  return response.data;
};

/**
 * Get category by ID
 */
export const getCategory = async (id: string): Promise<Category> => {
  const response = await apiClient.get<Category>(`/catalog/categories/${id}/`);
  return response.data;
};

/**
 * Create new category
 */
export const createCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
  const response = await apiClient.post<Category>('/catalog/categories/', categoryData);
  return response.data;
};

/**
 * Update category
 */
export const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<Category> => {
  const response = await apiClient.patch<Category>(`/catalog/categories/${id}/`, categoryData);
  return response.data;
};

/**
 * Delete category
 */
export const deleteCategory = async (id: string): Promise<void> => {
  await apiClient.delete(`/catalog/categories/${id}/`);
};

/**
 * Get paginated products list
 */
export const getProducts = async (page = 1, pageSize = 10): Promise<PaginatedResponse<Product>> => {
  const response = await apiClient.get<PaginatedResponse<Product>>('/catalog/products/', {
    params: { page, page_size: pageSize }
  });
  return response.data;
};

/**
 * Get product by ID
 */
export const getProduct = async (id: number): Promise<Product> => {
  const response = await apiClient.get<Product>(`/catalog/products/${id}/`);
  return response.data;
};

/**
 * Create new product
 */
export const createProduct = async (productData: CreateProduct): Promise<CreateProduct> => {
  const response = await apiClient.post<CreateProduct>('/catalog/products/', productData);
  return response.data;
};

/**
 * Update product
 */
export const updateProduct = async (id: number, productData: Partial<Product>): Promise<Product> => {
  const response = await apiClient.patch<Product>(`/catalog/products/${id}/`, productData);
  return response.data;
};

/**
 * Delete product
 */
export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/catalog/products/${id}/`);
};