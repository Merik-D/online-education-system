import { GradeSubmissionDto, PendingSubmissionDto } from "../models/admin.models";
import api from "./api";
export interface InstructorStatisticsDto {
  instructorId: number;
  totalCourses: number;
  totalStudents: number;
  averageCourseRating: number;
}
export const getPendingSubmissions = async (): Promise<PendingSubmissionDto[]> => {
  const response = await api.get<PendingSubmissionDto[]>("/instructor/submissions/pending");
  return response.data;
};
export const gradeSubmission = async (submissionId: number, data: GradeSubmissionDto) => {
  return await api.post(`/instructor/submissions/${submissionId}/grade`, data);
};
export const getInstructorStatistics = async (): Promise<InstructorStatisticsDto> => {
  const response = await api.get<InstructorStatisticsDto>("/instructor/statistics");
  return response.data;
};