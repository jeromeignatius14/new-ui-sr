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

export const  usePhoneAuth = () => {
  const router = useRouter();

  // We'll store SM user data in sessionStorage to pass between steps
  const storeSmUserData = (data: any) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('smUserData', JSON.stringify(data));
    }
  };
  
  const getSmUserData = () => {
    if (typeof window !== 'undefined') {
      const data = sessionStorage.getItem('smUserData');
      return data ? JSON.parse(data) : null;
    }
    return null;
  };

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
    onSuccess: async (data) => {
      // Check if the user is SM role
      const user = data.data.user;
      if (user?.role === 'SM') {
        // Store the response but don't sign in yet
        storeSmUserData(data.data);
        return data.data;
      }
      
      // For non-SM roles, proceed with normal sign in
      return handleAuthSuccess(data);
    },
  });
  
  // New mutation for handling login with depot for SM users
  const loginWithDepotMutation = useMutation({
    mutationFn: async ({ phone, depot }: { phone: string; depot: string }) => {
      // Get the stored SM user data
      const userData = getSmUserData();
      
      if (!userData) {
        throw new Error("User information not available");
      }
      
      // Add depot to user data
      const updatedUser = { 
        ...userData, 
        user: { ...userData.user, depot } 
      };
      
      // Return the updated user data
      return { data: updatedUser };
    },
    onSuccess: async (data) => handleAuthSuccess(data),
  });

  return {
    requestOtp: requestOtpMutation.mutate,
    verifyOtp: verifyOtpMutation.mutate,
    loginWithDepot: loginWithDepotMutation.mutate,
    isRequestingOtp: requestOtpMutation.isPending,
    isVerifyingOtp: verifyOtpMutation.isPending,
    isLoginWithDepot: loginWithDepotMutation.isPending,
    requestOtpError: requestOtpMutation.error,
    verifyOtpError: verifyOtpMutation.error,
    loginWithDepotError: loginWithDepotMutation.error,
    otpRequestData: requestOtpMutation.data,
    verifyOtpData: verifyOtpMutation.data
  };
};
