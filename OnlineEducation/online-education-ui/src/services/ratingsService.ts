import api from './api';
import { CreateRatingDto, RatingDto } from '../models/rating.models';
export const ratingsService = {
  async getCourseRatings(courseId: number): Promise<RatingDto[]> {
    const { data } = await api.get<RatingDto[]>(`/ratings/course/${courseId}`);
    return data;
  },
  async submitRating(payload: CreateRatingDto): Promise<RatingDto> {
    const { data } = await api.post<RatingDto>(`/ratings/submit`, payload);
    return data;
  },
  async deleteMyRating(ratingId: number): Promise<void> {
    await api.delete(`/ratings/${ratingId}`);
  },
};