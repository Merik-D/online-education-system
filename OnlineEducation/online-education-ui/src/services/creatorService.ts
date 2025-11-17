import { CourseDto } from '../models/course.models';
import { ModuleCreateDto, LessonCreateDto, CourseCreateDto } from '../models/creator.models';
import api from './api';

export const getMyCreatedCourses = async (): Promise<CourseDto[]> => {
    const response = await api.get<CourseDto[]>('/creator/my-courses');
    return response.data;
};

export const createCourse = async (data: CourseCreateDto): Promise<CourseDto> => {
    const response = await api.post<CourseDto>('/creator/courses', data);
    return response.data;
};

export const createModule = async (courseId: number, data: ModuleCreateDto) => {
    return await api.post(`/creator/courses/${courseId}/modules`, data);
};

export const createLesson = async (moduleId: number, data: LessonCreateDto) => {
    return await api.post(`/creator/modules/${moduleId}/lessons`, data);
};
