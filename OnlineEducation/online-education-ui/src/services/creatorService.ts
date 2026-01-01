import { CourseDto } from '../models/course.models';
import {
    ModuleCreateDto,
    LessonCreateDto,
    CourseCreateDto,
    TestCreateDto,
    QuestionCreateDto,
} from '../models/creator.models';
import api from './api';
export const getMyCreatedCourses = async (): Promise<CourseDto[]> => {
    const response = await api.get<CourseDto[]>('/creator/my-courses');
    return response.data;
};
export const getCourseStructure = async (courseId: number) => {
    const response = await api.get(`/creator/courses/${courseId}/structure`);
    return response.data;
};
export const createCourse = async (data: CourseCreateDto): Promise<CourseDto> => {
    const response = await api.post<CourseDto>('/creator/courses', data);
    return response.data;
};
export const updateCourse = async (courseId: number, data: CourseCreateDto): Promise<CourseDto> => {
    const response = await api.put<CourseDto>(`/creator/courses/${courseId}`, data);
    return response.data;
};
export const createModule = async (courseId: number, data: ModuleCreateDto) => {
    return await api.post(`/creator/courses/${courseId}/modules`, data);
};
export const updateModule = async (moduleId: number, data: ModuleCreateDto) => {
    return await api.put(`/creator/modules/${moduleId}`, data);
};
export const deleteModule = async (moduleId: number) => {
    return await api.delete(`/creator/modules/${moduleId}`);
};
export const createLesson = async (moduleId: number, data: LessonCreateDto) => {
    return await api.post(`/creator/modules/${moduleId}/lessons`, data);
};
export const updateLesson = async (lessonId: number, data: LessonCreateDto) => {
    return await api.put(`/creator/lessons/${lessonId}`, data);
};
export const deleteLesson = async (lessonId: number) => {
    return await api.delete(`/creator/lessons/${lessonId}`);
};
export const createTest = async (moduleId: number, data: TestCreateDto) => {
    return await api.post(`/creator/modules/${moduleId}/test`, data);
};
export const updateTest = async (testId: number, data: TestCreateDto) => {
    return await api.put(`/creator/tests/${testId}`, data);
};
export const deleteTest = async (testId: number) => {
    return await api.delete(`/creator/tests/${testId}`);
};
export const createQuestion = async (testId: number, data: QuestionCreateDto) => {
    return await api.post(`/creator/tests/${testId}/questions`, data);
};