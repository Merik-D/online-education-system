export interface AuthResponseDto {
  token: string;
  email: string;
  fullName: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginDto {
  email: string;
  password: string;
}