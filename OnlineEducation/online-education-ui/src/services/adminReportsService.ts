import axios from 'axios';
import {
  PlatformRatingsStatisticsDto,
  InstructorRatingsDto,
  PlatformRevenueDto,
  MonthlyRevenueDto,
  CoursePopularityDto,
} from '../models/reports.models';
const API_BASE = process.env.REACT_APP_API_URL || 'https://localhost:7256/api';
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
const adminReportsService = {
  getInstructorRatings: async (): Promise<PlatformRatingsStatisticsDto> => {
    const response = await axios.get(`${API_BASE}/reports/instructors-rating`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  getInstructorRatingDetails: async (instructorId: number): Promise<InstructorRatingsDto> => {
    const response = await axios.get(`${API_BASE}/reports/instructors-rating/${instructorId}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
  getPlatformRevenue: async (startDate?: string, endDate?: string): Promise<PlatformRevenueDto> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await axios.get(`${API_BASE}/reports/financial/platform`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data;
  },
  getMonthlyRevenue: async (monthsBack: number = 12): Promise<MonthlyRevenueDto[]> => {
    const response = await axios.get(`${API_BASE}/reports/financial/monthly`, {
      headers: getAuthHeader(),
      params: { monthsBack },
    });
    return response.data;
  },
  getCoursesPopularity: async (pageNumber: number = 1, pageSize: number = 10): Promise<CoursePopularityDto[]> => {
    const response = await axios.get(`${API_BASE}/reports/courses-popularity`, {
      headers: getAuthHeader(),
      params: { pageNumber, pageSize },
    });
    return response.data;
  },
};
export default adminReportsService;