export interface ResponseFormat<T = any> {
  success: boolean;
  statusCode: number;
  error?: string;
  message?: string;
  data?: T;
}
