export interface RecommendedCourseDto {
  id: number;
  title: string;
  description: string;
  level: string;
  enrollmentCount: number;
  averageRating: number;
  category: string;
  recommendationScore: number;
  recommendationReason: string;
  instructorName: string;
  recommendationId: number;
}
export interface CourseRecommendationListDto {
  totalRecommendations: number;
  recommendations: RecommendedCourseDto[];
  filterApplied: string;
}
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}