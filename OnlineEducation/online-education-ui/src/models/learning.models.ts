import { LessonType } from './enums';

export interface LessonDto {
  id: number;
  title: string;
  order: number;
  type: LessonType;
  videoUrl?: string;
  textContent?: string;
}

export interface ModuleDto {
  id: number;
  title: string;
  order: number;
  lessons: LessonDto[];
}

export interface MyCourseDetailsDto {
  courseId: number;
  title: string;
  progress: number;
  modules: ModuleDto[];
}

export interface AnswerSubmissionDto {
  questionId: number;
  answerText?: string;
  selectedOptionIds: number[];
}

export interface TestSubmissionDto {
  answers: AnswerSubmissionDto[];
}

export interface GradingResultDto {
  submissionId: number;
  status: number;
  score?: number;
}