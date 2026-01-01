export interface CreateRatingDto {
  courseId: number;
  rating: number;
  comment?: string;
}
export interface RatingDto {
  id: number;
  rating: number;
  comment?: string;
  studentName: string;
  createdAt: string;
  isVerified: boolean;
}
export interface InstructorRatingDto {
  instructorId: number;
  instructorName: string;
  averageRating: number;
  totalRatings: number;
  ratingDistribution: Record<number, number>;
  recentReviews: RatingDto[];
}