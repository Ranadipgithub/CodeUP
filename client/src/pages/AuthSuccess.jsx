import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "@/authSlice"; 
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  
  // Ref to prevent double-dispatch of checkAuth
  const checkCalled = useRef(false);

  // 1. Trigger checkAuth
  useEffect(() => {
    if (!isAuthenticated && !checkCalled.current) {
      checkCalled.current = true;
      dispatch(checkAuth());
    }
  }, [isAuthenticated, dispatch]);

  // 2. Handle Redirection
  useEffect(() => {
    if (isAuthenticated) {
      // Retrieve the path every time the effect runs
      const returnPath = localStorage.getItem("auth_return_path");
      
      // Default to "/" if returnPath is missing or string "undefined"
      const target = returnPath && returnPath !== "undefined" ? returnPath : "/";
      
      console.log("Scheduled redirect to:", target); // Verify this stays correct

      const timer = setTimeout(() => {
        // --- FIX: Only remove the item RIGHT BEFORE navigating ---
        localStorage.removeItem("auth_return_path"); 
        navigate(target, { replace: true });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#4ADE80]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-md w-full">
        {/* Animated Icon Container */}
        <div className={`w-20 h-20 bg-[#121212] border rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(74,222,128,0.2)] transition-colors duration-500 ${
          error ? "border-red-500/30" : "border-[#4ADE80]/30"
        }`}>
          {isAuthenticated ? (
            <CheckCircle2 
              size={40} 
              className="text-[#4ADE80] animate-in zoom-in duration-300" 
            />
          ) : error ? (
             <XCircle 
              size={40} 
              className="text-red-500 animate-in zoom-in duration-300" 
            />
          ) : (
            <Loader2 
              size={40} 
              className="text-[#4ADE80] animate-spin" 
            />
          )}
        </div>

        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
          {isAuthenticated 
            ? "Successfully Logged In" 
            : error 
              ? "Authentication Failed" 
              : "Verifying Session..."}
        </h2>
        
        <p className="text-gray-400 text-sm">
          {isAuthenticated 
            ? "Redirecting you back to your session..." 
            : error
              ? "Could not verify your Google account. Redirecting to login..."
              : "Please wait while we sync your credentials."}
        </p>

        {/* Loading Bar */}
        {!error && !isAuthenticated && (
          <div className="w-full max-w-[200px] h-1 bg-[#1A1A1A] rounded-full mt-8 overflow-hidden">
            <div className="h-full bg-[#4ADE80] animate-progress origin-left w-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthSuccess;