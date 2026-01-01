export interface CourseRevenueDto {
  courseId: number;
  courseName: string;
  enrollmentCount: number;
  totalRevenue: number;
  revenuePerStudent: number;
}
export interface MonthlyRevenueDto {
  month: string;
  revenue: number;
  enrollments: number;
}
export interface FinancialReportDto {
  instructorId: number;
  instructorName: string;
  totalRevenue: number;
  pendingRevenue: number;
  totalEnrollments: number;
  averagePerCourse: number;
  courseBreakdown: CourseRevenueDto[];
  monthlyTrend: MonthlyRevenueDto[];
}
export interface PlatformRevenueDto {
  totalRevenue: number;
  startDate: string;
  endDate: string;
}
export interface InstructorRatingsDto {
  instructorId: number;
  instructorName: string;
  email: string;
  averageRating: number;
  totalReviews: number;
  totalCourses: number;
  totalStudents: number;
  courseRatings: CourseRatingBreakdownDto[];
}
export interface CourseRatingBreakdownDto {
  courseId: number;
  courseName: string;
  averageRating: number;
  reviewCount: number;
  enrollmentCount: number;
}
export interface PlatformRatingsStatisticsDto {
  averagePlatformRating: number;
  totalReviews: number;
  totalInstructors: number;
  totalCourses: number;
  topInstructors: TopRatedInstructorDto[];
  lowestRatedInstructors: LowestRatedInstructorDto[];
}
export interface TopRatedInstructorDto {
  instructorId: number;
  name: string;
  averageRating: number;
  reviewCount: number;
}
export interface LowestRatedInstructorDto {
  instructorId: number;
  name: string;
  averageRating: number;
  reviewCount: number;
}
export interface CoursePopularityDto {
  courseId: number;
  title: string;
  instructorName: string;
  enrollmentCount: number;
  averageRating: number;
  category: string;
}