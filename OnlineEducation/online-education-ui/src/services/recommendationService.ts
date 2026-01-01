import api from './api';
import { ApiResponse, CourseRecommendationListDto } from '../models/recommendation.models';
export const getMyRecommendations = async (pageNumber = 1, pageSize = 10): Promise<ApiResponse<CourseRecommendationListDto>> => {
  const res = await api.get<ApiResponse<CourseRecommendationListDto>>(`/recommendations/my-recommendations?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  return res.data;
};
export const getTrending = async (pageNumber = 1, pageSize = 10): Promise<ApiResponse<CourseRecommendationListDto>> => {
  const res = await api.get<ApiResponse<CourseRecommendationListDto>>(`/recommendations/trending?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  return res.data;
};
export const getSimilar = async (pageNumber = 1, pageSize = 10): Promise<ApiResponse<CourseRecommendationListDto>> => {
  const res = await api.get<ApiResponse<CourseRecommendationListDto>>(`/recommendations/similar?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  return res.data;
};
export const markRecommendationViewed = async (recommendationId: number) => {
  await api.post(`/recommendations/recommendations/${recommendationId}/mark-viewed`);
};
export const trackInteraction = async (courseId: number, interactionType: string = 'view') => {
  await api.post(`/recommendations/courses/${courseId}/track-interaction?interactionType=${encodeURIComponent(interactionType)}`);
};
export const regenerateRecommendations = async () => {
  await api.post(`/recommendations/regenerate`);
};