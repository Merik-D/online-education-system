export interface CertificateDto {
  id: number;
  studentId: number;
  studentName: string;
  courseId: number;
  courseTitle: string;
  issuedAt: string;
  submissionId: number;
  score?: number;
}