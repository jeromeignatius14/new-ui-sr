import { useMutation } from "@tanstack/react-query";
import { authService } from "../api/auth";
import { LoginInput } from "@/app/validation/auth";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { handleUserRedirect } from "@/app/utils/routeHandler";

const handleAuthSuccess = async (data: any) => {
  try {
    const result = await signIn("credentials", {
      redirect: false,
      accessToken: data.data.access_token || data.data.data?.access_token,
      refreshToken: data.data.refresh_token || data.data.data?.refresh_token,
      user: JSON.stringify(data.data.user),
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    // Handle redirection based on user role
    handleUserRedirect(data.data.user);

    // Return the user data for handling redirect in the component
    return data.data.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const useAuth = () => {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: async (data) => {
      const user = await handleAuthSuccess(data);
      
      // Handle redirection based on user role
      if (user.role === "DEPT_CONTROLLER") {
        router.push("/manage/request-table");
      } 
      
      else if(user.role==="SM"){
    // window.location.href = `https://smr-dashboard.plattorian.tech/?cugNumber=${user.phone ?? ""}&section=MAS-GDR`;
     window.location.href=`https://smr-dashboard.plattorian.tech/?cugNumber=${user?.phone}&stationCode=${user?.depot}&user=SM&token=W1IU66ZFEBFBF6C1dGmouN6PVyHARQJg`
 
  }
      
      else if (user.role === "BOARD_CONTROLLER") {
        router.push("/tpc");
      }
      
      else if (user.role === "ADMIN") {
        router.push("/admin/request-table");
      } else {
        router.push("/dashboard");
      }
    },
  });

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  };
};

export const usePhoneAuth = () => {
  const router = useRouter();

  const requestOtpMutation = useMutation({
    mutationFn: (phone: string) => authService.requestOtp(phone),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: ({
      phone,
      otp,
      otpId,
    }: {
      phone: string;
      otp: string;
      otpId: string;
    }) => authService.verifyOtp(phone, otp, otpId),
    onSuccess: async (data) => handleAuthSuccess(data),
  });

  return {
    requestOtp: requestOtpMutation.mutate,
    verifyOtp: verifyOtpMutation.mutate,
    isRequestingOtp: requestOtpMutation.isPending,
    isVerifyingOtp: verifyOtpMutation.isPending,
    requestOtpError: requestOtpMutation.error,
    verifyOtpError: verifyOtpMutation.error,
    otpRequestData: requestOtpMutation.data,
  };
};
