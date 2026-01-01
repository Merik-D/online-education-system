import api from './api';
import { FinancialReportDto } from '../models/reports.models';
export const getInstructorFinancialReport = async (
  instructorId: number,
  startDate?: string,
  endDate?: string
): Promise<FinancialReportDto> => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get<FinancialReportDto>(`/reports/financial/instructor/${instructorId}`, { params });
  return response.data;
};