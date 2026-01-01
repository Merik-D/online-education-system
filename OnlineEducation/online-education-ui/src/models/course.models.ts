export interface CourseDto {
  id: number;
  title: string;
  description: string;
  level: string;
  instructorId: number;
  instructorName?: string;
  categoryId: number;
  categoryName?: string;
  averageRating?: number;
  reviewCount: number;
}