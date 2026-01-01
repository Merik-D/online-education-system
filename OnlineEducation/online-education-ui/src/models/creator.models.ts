import { LessonType, CourseLevel, GradingStrategyType, QuestionType } from './enums';
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
export interface TestCreateDto {
  title: string;
  strategyType: GradingStrategyType;
}
export interface OptionCreateDto {
  text: string;
  isCorrect: boolean;
}
export interface QuestionCreateDto {
  text: string;
  type: QuestionType;
  order: number;
  options: OptionCreateDto[];
}