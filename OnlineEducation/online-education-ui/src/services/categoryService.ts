import api from './api';
export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
}
export const getCategories = async (): Promise<CategoryDto[]> => {
  const response = await api.get<CategoryDto[]>('/categories');
  return response.data;
};
export const getCategoryById = async (id: number): Promise<CategoryDto> => {
  const response = await api.get<CategoryDto>(`/categories/${id}`);
  return response.data;
};