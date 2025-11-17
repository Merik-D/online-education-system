import { GradeSubmissionDto, PendingSubmissionDto, UserDto, UserStatsDto } from "../models/admin.models";
import api from "./api";

export const getPendingSubmissions = async (): Promise<PendingSubmissionDto[]> => {
    const response = await api.get<PendingSubmissionDto[]>('/admin/submissions/pending');
    return response.data;
}

export const adminGradeSubmission = async (submissionId: number, data: GradeSubmissionDto) => {
    return await api.post(`/admin/submissions/${submissionId}/grade`, data);
}

export const getUserStats = async (): Promise<UserStatsDto> => {
    const response = await api.get<UserStatsDto>('/admin/stats');
    return response.data;
}

export const getAllUsers = async (): Promise<UserDto[]> => {
    const response = await api.get<UserDto[]>('/admin/users');
    return response.data;
}

export const toggleUserBlock = async (userId: number) => {
    return await api.post(`/admin/users/${userId}/toggle-block`);
}