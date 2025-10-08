import axiosInstance, { axiosPublicInstance } from "@/app/utils/axiosInstance";
import { LoginInput } from "@/app/validation/auth";
// import router from "next/router";

export interface LoginResponse {
  status: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      department: string;
      phone: string;
    };
  };
}

export interface RefreshTokenResponse {
  status: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
  };
}

export interface ApiError {
  status: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export interface RequestOtpResponse {
  status: boolean;
  message: string;
  data: {
    otpId: string;
  };
}

export interface VerifyOtpResponse {
  status: boolean;
  message: string;
  data: {
    data: {
      access_token: string;
      refresh_token: string;
    };
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      department: string;
      phone: string;
    };
  };
}

export interface SMLoginWithDepotResponse {
  status: boolean;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      department: string;
      phone: string;
      depot: string;
    };
  };
}

export const authService = {
  login: async (data: LoginInput): Promise<LoginResponse> => {
    try {
      const response = await axiosPublicInstance.post<LoginResponse>(
        "/api/auth/login",
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Login API error:", error.response?.data || error.message);
      if (error.response?.data) {
        throw error.response.data;
      }
      throw new Error(error.message || "Login failed. Please try again.");
    }
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    try {
      const response = await axiosInstance.post<RefreshTokenResponse>(
        "/api/auth/refresh-token",
        {
          refresh_token: refreshToken,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Token refresh error:",
        error.response?.data || error.message
      );
       if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      throw new Error("Session expired. Please login again.");
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage regardless of API success
      localStorage.removeItem("token");
    }
  },
  requestOtp: async (phone: string): Promise<RequestOtpResponse> => {
    try {
      const response = await axiosPublicInstance.post<RequestOtpResponse>(
        "/api/auth/phone-login",
        { phone }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Request OTP error:",
        error.response?.data || error.message
      );
      if (error.response?.data) {
        throw error.response.data;
      }
      throw new Error(
        error.message || "Failed to request OTP. Please try again."
      );
    }
  },

  verifyOtp: async (
    phone: string,
    otpCode: string,
    otpId: string
  ): Promise<VerifyOtpResponse> => {
    try {
      const response = await axiosPublicInstance.post<VerifyOtpResponse>(
        "/api/auth/verify-phone-otp",
        {
          phone,
          otpCode,
          otpId,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Verify OTP error:", error.response?.data || error.message);
      if (error.response?.data) {
        throw error.response.data;
      }
      throw new Error(
        error.message || "OTP verification failed. Please try again."
      );
    }
  },
};
