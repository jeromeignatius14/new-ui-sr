"use client";

import AddToHomeScreenPrompt from "@/app/components/AddToHomeScreenPrompt";
import LoginForm from "@/app/components/auth/LoginForm";
import { useSession } from "next-auth/react";

export default function LoginPage() {
    const { data: session } = useSession();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-[#c6f5d6] p-2">
      <AddToHomeScreenPrompt /> 
      {/* Header */}
      <div className="w-full max-w-md mx-auto rounded-lg border-4 border-black bg-yellow-200 mt-2 mb-4 p-2 relative">
        <img
          src="/logo without background.png"
          alt="Indian Railways Logo"
          className="absolute left-0 right-5 top-0 w-25 h-32 object-contain"
        />
        <div className="flex flex-col items-right justify-center ml-18">
          <h1 className="text-center text-2xl font-extrabold text-[#b07be0] leading-tight mt-2">
            Rolling Block
            <br />
            Management System
            <br />
            <span className="text-2xl sm:text-3xl font-extrabold">(RBMS-{session?.user?.location}-DIVN)</span>
          </h1>
        </div>
      </div>

      {/* Login Form */}
      <div className="w-full   flex flex-col justify-center items-center">
        <LoginForm />
      </div>

      {/* Yellow oval for developer credit */}

      <div className="w-full flex justify-center mt-2 mb-2">
        <div className="w-fit px-10 bg-[#f9e38e] flex flex-col items-center justify-center font-bold text-black text-2xl text-center tracking-wide border-none">
          App designed & developed by
          <br />
          Southern Railway
        </div>
      </div>

      {/* Train image at the bottom */}
      {/* <div
        className="relative w-full"
        style={{ height: "60vw", minHeight: "200px", maxHeight: "350px" }}
      >
        <img
          src="/train image.png"
          alt="Train"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90"
          style={{
            height: "100vw",
            width: "auto",
            maxWidth: "unset",
            maxHeight: "unset",
          }}
        />
      </div> */}


      <div className="w-full mt-[28vw] sm:mt-[26vw] md:mt-[24vw] lg:mt-[22vw]">
  
  <div
    className="relative w-full"
    style={{ height: "60vw", minHeight: "200px", maxHeight: "350px" }}
  >
    <img
      src="/train image.png"
      alt="Train"
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90"
      style={{
        height: "100vw",
        width: "auto",
        maxWidth: "unset",
        maxHeight: "unset",
      }}
    />
  </div>
</div>
    </div>
  );
}
