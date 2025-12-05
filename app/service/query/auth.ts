import { useMutation } from "@tanstack/react-query";
import { authService } from "../api/auth";
import { LoginInput } from "@/app/validation/auth";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { handleUserRedirect } from "@/app/utils/routeHandler";

const handleAuthSuccess = async (data: any) => {
      let user = data.data.user;

    
 if (user.role === "ADMIN"&&user.location==="TVC") {
  user.id = "7d2be6c1-3f59-4b92-97a1-9b0e4fd7c94b";
    }
    if (user.role === "ADMIN"&&user.location==="MDU") {
  user.id = "f9c20e1a-4c63-4f3a-a8e4-7e3ef0d10f79";
    }
    if (user.role === "ADMIN"&&user.location==="SA") {
  user.id = "e2c3b1d6-2a75-4f9d-8e21-91f27cbfe987";
    }
    if (user.role === "ADMIN"&&user.location==="PGT") {
  user.id = "3a6fcb3d-8b79-4de7-9702-c74d5a3fe5d2";
    }
    if (user.role === "ADMIN"&&user.location==="TPJ") {
  user.id = "8f0bbcf2-8ad1-44b6-9f85-44c2f7abdeaf";
    }
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
