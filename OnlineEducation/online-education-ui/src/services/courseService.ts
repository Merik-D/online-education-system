import { CourseDto } from '../models/course.models';
import api from './api';
export interface CourseSearchParams {
  searchTerm?: string;
  categoryId?: number;
  instructorId?: number;
  level?: number;
  minRating?: number;
  sortBy?: string;
  isDescending?: boolean;
  pageNumber?: number;
  pageSize?: number;
}
export interface CourseSearchResult {
  courses: CourseDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
export const getCourses = async (): Promise<CourseDto[]> => {
  const response = await api.get<CourseDto[]>('/courses');
  return response.data;
};
export const getCourseById = async (id: number): Promise<CourseDto> => {
  const response = await api.get<CourseDto>(`/courses/${id}`);
  return response.data;
};
export const searchCourses = async (params: CourseSearchParams): Promise<CourseSearchResult> => {
  const response = await api.get<CourseSearchResult>('/courses/search', { params });
  return response.data;
};
export const getCoursesByCategory = async (
  categoryId: number,
  pageNumber: number = 1,
  pageSize: number = 12
): Promise<CourseDto[]> => {
  const response = await api.get<CourseDto[]>(`/courses/categories/${categoryId}`, {
    params: { pageNumber, pageSize },
  });
  return response.data;
};