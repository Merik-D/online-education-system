import { QuestionType } from "./enums";

export interface GradeSubmissionDto { 
  score: number;
}
export interface SelectedOptionDto { 
  optionId: number;
  optionText: string;
}
export interface StudentAnswerDto { 
  questionId: number;
  questionText: string;
  questionType: QuestionType;
  answerText?: string;
  selectedOptions: SelectedOptionDto[];
}
export interface PendingSubmissionDto { 
  submissionId: number;
  testTitle: string;
  studentName: string;
  submittedAt: string;
  answers: StudentAnswerDto[];
}

export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  roles: string[];
  isLockedOut: boolean;
}

export interface UserStatsDto {
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
}