// Service for notification token registration
import axiosInstance from '@/app/utils/axiosInstance';

export interface RegisterTokenResponse {
  status: boolean;
  message: string;
  data?: any;
}

export const notificationService = {
  registerToken: async (token: string): Promise<RegisterTokenResponse> => {
    const response = await axiosInstance.post<RegisterTokenResponse>(
      '/api/notifications/register-token',
      { token }
    );
    return response.data;
  },
};

export default notificationService;
