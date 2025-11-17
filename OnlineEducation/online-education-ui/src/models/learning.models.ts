import { LessonType, QuestionType, SubmissionStatus } from './enums';

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

export interface OptionDto {
  id: number;
  text: string;
}

export interface QuestionDto {
  id: number;
  text: string;
  type: QuestionType;
  order: number;
  options: OptionDto[];
}

export interface TestDetailsDto {
  id: number;
  title: string;
  questions: QuestionDto[];
}

export interface AnswerDetailDto {
  questionId: number;
  questionText: string;
  questionType: QuestionType;
  studentAnswerText?: string;
  studentSelectedOptions: OptionDto[];
  correctOptions: OptionDto[];
  isCorrect: boolean;
}

export interface SubmissionResultDto {
  submissionId: number;
  testTitle: string;
  status: SubmissionStatus;
  score?: number;
  answers: AnswerDetailDto[];
}