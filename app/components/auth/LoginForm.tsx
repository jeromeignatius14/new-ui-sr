"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { PhoneLoginInput, phoneLoginSchema } from "@/app/validation/auth";
import { usePhoneAuth } from "@/app/service/query/auth";
import { depotOnLocation } from "@/app/lib/store";

/**
 * Phone Login Form Component
 * Handles user authentication with phone number and OTP
 */
export default function PhoneLoginForm() {
  const [step, setStep] = useState<"phone" | "otp" | "depot">("phone");
  const [otpId, setOtpId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedDepot, setSelectedDepot] = useState<string>("");
  const router = useRouter();
  
  // List of depots for SM to select from
  const availableDepots = depotOnLocation["MAS"] || [];
  
  const { 
    requestOtp,  
    verifyOtp, 
    isRequestingOtp, 
    isVerifyingOtp, 
    isLoginWithDepot,
    requestOtpError, 
    verifyOtpError,
    loginWithDepotError,
    otpRequestData,
    loginWithDepot,
    verifyOtpData
  } = usePhoneAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PhoneLoginInput & { depot?: string }>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      phone: "",
      otp: "",
      depot: "",
    },
  });

  const phone = watch("phone");
  const isLoading = isRequestingOtp || isVerifyingOtp || isLoginWithDepot;

  // Update error state when API errors change
  useEffect(() => {
    if (requestOtpError) {
      setAuthError((requestOtpError as any)?.message || "Failed to send OTP");
    } else if (verifyOtpError) {
      setAuthError((verifyOtpError as any)?.message || "Failed to verify OTP");
    } else if (loginWithDepotError) {
      setAuthError((loginWithDepotError as any)?.message || "Failed to login with selected depot");
    } else {
      setAuthError(null);
    }
  }, [requestOtpError, verifyOtpError, loginWithDepotError]);

  // Update otpId when received from API
  useEffect(() => {
    if (otpRequestData?.data?.otpId) {
      setOtpId(otpRequestData.data.otpId);
      setStep("otp");
    }
  }, [otpRequestData]);
  
  // Handle response when OTP verification is successful
  useEffect(() => {
    if (verifyOtpData?.data?.user?.role === "SM") {
      setUserRole("SM");
      setStep("depot");
    }
  }, [verifyOtpData]);

  /**
   * Handle form submission based on current step
   */
  const onSubmit = async (data: PhoneLoginInput & { depot?: string }) => {
    setAuthError(null);

    if (step === "phone") {
      // Request OTP
      try {
        requestOtp(data.phone);
      } catch (error: any) {
        console.error("Request OTP error:", error);
        setAuthError(error.message || "Failed to send OTP. Please try again.");
      }
    } else if (step === "otp" && otpId) {
      // Verify OTP
      try {
        verifyOtp({
          phone: data.phone,
          otp: data.otp || "",
          otpId: otpId
        });
        
        // The useEffect will handle the response
        // and update the UI accordingly when verifyOtpData changes
      } catch (error: any) {
        console.error("Verify OTP error:", error);
        setAuthError(error.message || "Failed to verify OTP. Please try again.");
      }
    } else if (step === "depot") {
      // Login with selected depot
      try {
        if (!selectedDepot) {
          setAuthError("Please select a depot");
          return;
        }
        
        // Validate that selected depot exists in available depots
        if (!availableDepots.includes(selectedDepot)) {
          // Try to find a close match
          const closestMatch = availableDepots.find(
            depot => depot.toLowerCase().includes(selectedDepot.toLowerCase())
          );
          
          if (closestMatch) {
            setSelectedDepot(closestMatch);
            setAuthError(`Using closest match: ${closestMatch}`);
            // Wait a moment before submitting with the corrected depot
            setTimeout(() => {
              loginWithDepot({
                phone: data.phone,
                depot: closestMatch
              });
            }, 1000);
            return;
          } else {
            setAuthError("Invalid depot selection. Please choose from the list.");
            return;
          }
        }
        
        // Call login with depot selection
        await loginWithDepot({
          phone: data.phone,
          depot: selectedDepot
        });
      } catch (error: any) {
        console.error("Login error:", error);
        setAuthError(error.message || "Failed to login. Please try again.");
      }
    }
  };

  // Focus on the appropriate input when step changes
  useEffect(() => {
    if (step === "otp") {
      const input = document.querySelector<HTMLInputElement>('input[name="otp"]');
      input?.focus();
    } else if (step === "depot") {
      const select = document.querySelector<HTMLSelectElement>('select[name="depot"]');
      select?.focus();
    }
  }, [step]);
  
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full flex flex-col items-center bg-white/60 rounded-2xl shadow-lg p-6 mb-4 border border-gray-200 backdrop-blur-md"
      style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
    >
      {/* Phone Number Input */}
      <div className="w-full flex items-center mb-4">
        <input
          type="tel"
          {...register("phone")}
          placeholder="Phone Number"
          typeof="tel"
          disabled={step !== "phone"}
          className="w-full flex-1 bg-[#eeb8f7] text-white font-semibold rounded-xl px-4 py-3 text-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white placeholder:font-bold border-none"
          style={{
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
            WebkitBoxShadow: "0 0 0 1000px #eeb8f7 inset",
            WebkitTextFillColor: "white",
            caretColor: "white",
            opacity: step !== "phone" ? 0.7 : 1
          }}
        />
      </div>

      {/* OTP Input */}
      <div className="w-full flex items-center mb-4" style={{ display: step === "phone" || step === "depot" ? 'none' : 'flex' }}>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          {...register("otp")}
          placeholder="Enter OTP"
          disabled={step !== "otp"}
          className="w-full flex-1 bg-[#eeb8f7] text-white font-semibold rounded-xl px-4 py-3 text-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white placeholder:font-bold border-none"
          style={{
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
            WebkitBoxShadow: "0 0 0 1000px #eeb8f7 inset",
            WebkitTextFillColor: "white",
            caretColor: "white",
          }}
        />
      </div>
      
      {/* Depot Selection for SM with search capability */}
      {step === "depot" && (
        <div className="w-full flex flex-col mb-4">
          <div className="w-full relative">
            <input
              type="text"
              value={selectedDepot}
              onChange={(e) => setSelectedDepot(e.target.value)}
              placeholder="Type to search depot"
             className="w-full flex-1 bg-[#eeb8f7] text-white font-semibold rounded-xl px-4 py-3 text-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white placeholder:font-bold border-none"
              style={{
                boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
                WebkitBoxShadow: "0 0 0 1000px #eeb8f7 inset",
                WebkitTextFillColor: "white",
                caretColor: "white",
              }}
            />
          </div>
          
          {/* Display depot options based on search input */}
          {selectedDepot && (
            <div className="w-full max-h-40 overflow-y-auto font-semibold bg-[#eeb8f7] rounded-lg border border-purple-200 shadow-lg">
              {availableDepots
                .filter(depot => 
                  depot.toLowerCase().includes(selectedDepot.toLowerCase()) ||
                  selectedDepot.toLowerCase().includes(depot.toLowerCase())
                )
                .map(depot => (
                  <div 
                    key={depot}
                    onClick={() => setSelectedDepot(depot)}
                    className={`px-4 py-2 cursor-pointer hover:bg-purple-300 ${
                      selectedDepot === depot ? 'bg-[#eeb8f7] font-bold' : ''
                    }`}
                  >
                    {depot}
                  </div>
                ))}
            </div>
          )}

        </div>
      )}

      {/* Error message */}
      {authError && (
        <div className="w-full text-red-500 text-sm mb-4 text-center">
          {authError}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || (step === "depot" && !selectedDepot)}
        className="flex items-center justify-center font-bold text-black text-2xl"
        style={{
          width: "180px",
          height: "100px",
          backgroundColor: "#f4a47c",
          borderRadius: "50%",
          letterSpacing: "1px",
          border: "none",
        }}
      >
        {isLoading 
          ? (step === "phone" ? "Sending OTP..." : step === "otp" ? "Verifying..." : "Logging in...") 
          : (step === "phone" 
              ? "GET OTP" 
              : step === "otp" 
                ? "Click to Login" 
                : selectedDepot ? "Login with Depot" : "Select Depot")}
      </button>
    </form>
  );
}