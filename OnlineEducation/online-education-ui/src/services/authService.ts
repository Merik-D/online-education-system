import { AuthResponseDto, LoginDto, RegisterDto } from '../models/auth.models';
import api from './api';

export const register = async (data: RegisterDto) => {
  return await api.post('/auth/register', data);
};

export const login = async (data: LoginDto): Promise<AuthResponseDto> => {
  const response = await api.post<AuthResponseDto>('/auth/login', data);
  return response.data;
};