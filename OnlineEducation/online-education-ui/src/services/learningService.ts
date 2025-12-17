import { CourseDto } from '../models/course.models';
import { MyCourseDetailsDto, TestSubmissionDto, GradingResultDto, LessonDto, TestDetailsDto, SubmissionResultDto } from '../models/learning.models';
import api from './api';

export const enrollInCourse = async (courseId: number) => {
  return await api.post(`/learning/courses/${courseId}/enroll`);
};

export const getMyCourses = async (): Promise<CourseDto[]> => {
  const response = await api.get<CourseDto[]>('/learning/my-courses');
  return response.data;
};

export const getCourseDetails = async (courseId: number): Promise<MyCourseDetailsDto> => {
  const response = await api.get<MyCourseDetailsDto>(`/learning/courses/${courseId}/details`);
  return response.data;
};

export const submitTest = async (testId: number, data: TestSubmissionDto): Promise<GradingResultDto> => {
  const response = await api.post<GradingResultDto>(`/learning/test/${testId}/submit`, data);
  return response.data;
};

export const getLessonById = async (lessonId: number): Promise<LessonDto> => {
  const response = await api.get<LessonDto>(`/learning/lessons/${lessonId}`);
  return response.data;
};

export const getTestDetails = async (testId: number): Promise<TestDetailsDto> => {
  const response = await api.get<TestDetailsDto>(`/learning/test/${testId}`);
  return response.data;
};

export const completeLesson = async (lessonId: number): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(`/learning/lessons/${lessonId}/complete`);
  return response.data;
};
