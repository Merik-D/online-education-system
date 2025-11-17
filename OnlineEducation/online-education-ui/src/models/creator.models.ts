import { LessonType, CourseLevel } from './enums';

export interface CourseCreateDto {
  title: string;
  description: string;
  level: CourseLevel;
  categoryId: number;
}

export interface ModuleCreateDto {
  title: string;
  order: number;
}

export interface LessonCreateDto {
  title: string;
  order: number;
  type: LessonType;
  videoUrl?: string;
  textContent?: string;
}