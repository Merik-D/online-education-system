import axios from 'axios';
import { CertificateDto } from '../models/certificate.models';
const API_URL = 'https://localhost:7256/api/Certificates';
export const generateCertificate = async (submissionId: number): Promise<{ certificateId: number; message: string }> => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/generate/${submissionId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
export const generateCertificateForCourse = async (courseId: number): Promise<{ certificateId: number; message: string }> => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/generate/course/${courseId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
export const getCertificateById = async (id: number): Promise<CertificateDto> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const getMyCertificates = async (): Promise<CertificateDto[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/my-certificates`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
export const getCourseCertificates = async (courseId: number): Promise<CertificateDto[]> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/course/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};