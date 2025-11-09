import { CourseDto } from '../models/course.models';
import api from './api';

export const getCourses = async (): Promise<CourseDto[]> => {
  const response = await api.get<CourseDto[]>('/courses');
  return response.data;
};

export const getCourseById = async (id: number): Promise<CourseDto> => {
  const response = await api.get<CourseDto>(`/courses/${id}`);
  return response.data;
};