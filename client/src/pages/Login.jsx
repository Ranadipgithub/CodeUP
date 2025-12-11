// import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router";
// import { loginUser } from "@/authSlice";

// // validation schema
// const signupSchema = z.object({
//   emailId: z.string().email("Invalid email address"),
//   password: z.string().min(6, "Password should contain at least 6 characters"),
// });

// const Login = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const {isAuthenticated, loading} = useSelector((state) => state.auth);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm({
//     resolver: zodResolver(signupSchema),
//   });

//   const [showPassword, setShowPassword] = useState(false);

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate("/");
//     }
//   }, [isAuthenticated, navigate]);

//   function onSubmit(data) {
//     dispatch(loginUser(data));
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
//       <div className="w-full max-w-md bg-white rounded-2xl shadow-lg ring-1 ring-gray-100 overflow-hidden">
//         <div className="px-8 py-6">
//           <h2 className="text-2xl font-semibold text-gray-900">
//             Welcome Back!
//           </h2>
//           <p className="mt-1 text-sm text-gray-500">
//             Please enter your credentials to continue.
//           </p>

//           <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="mt-6 space-y-5"
//             noValidate
//           >
//             {/* Email */}
//             <div>
//               <label
//                 htmlFor="emailId"
//                 className="block text-sm font-medium text-gray-700"
//               >
//                 Email address
//               </label>
//               <input
//                 id="emailId"
//                 type="email"
//                 {...register("emailId")}
//                 aria-invalid={errors.emailId ? "true" : "false"}
//                 className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-gray-900
//                   shadow-sm placeholder-gray-400
//                   focus:outline-none focus:ring-2 focus:ring-indigo-500
//                   ${
//                     errors.emailId
//                       ? "border-red-300 bg-red-50"
//                       : "border-gray-200 bg-white"
//                   }`}
//                 placeholder="you@example.com"
//               />
//               {errors.emailId && (
//                 <p className="mt-1 text-xs text-red-600" role="alert">
//                   {errors.emailId.message}
//                 </p>
//               )}
//             </div>

//             {/* Password with show/hide */}
//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-medium text-gray-700"
//               >
//                 Password
//               </label>

//               <div className="relative mt-1">
//                 <input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   {...register("password")}
//                   aria-invalid={errors.password ? "true" : "false"}
//                   className={`block w-full rounded-lg border px-3 py-2 text-sm text-gray-900
//                     shadow-sm placeholder-gray-400
//                     focus:outline-none focus:ring-2 focus:ring-indigo-500
//                     ${
//                       errors.password
//                         ? "border-red-300 bg-red-50"
//                         : "border-gray-200 bg-white"
//                     }`}
//                   placeholder="••••••••"
//                   autoComplete="new-password"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((s) => !s)}
//                   className="absolute inset-y-0 right-2 flex items-center px-2 text-sm text-gray-600 hover:text-gray-900"
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                 >
//                   {showPassword ? "Hide" : "Show"}
//                 </button>
//               </div>

//               <p className="mt-2 text-xs text-gray-500">
//                 Password must be at least 6 characters.
//               </p>
//               {errors.password && (
//                 <p className="mt-1 text-xs text-red-600" role="alert">
//                   {errors.password.message}
//                 </p>
//               )}
//             </div>

//             {/* Submit */}
//             <div>
//               <Button
//                 type="submit"
//                 className="w-full bg-gray-800 hover:bg-gray-700 text-white transition-colors duration-150 ease-in-out cursor-pointer"
//                 disabled={loading}
//               >
//                 {loading ? "Submitting..." : "Login"}
//               </Button>
//             </div>

//             <div className="mt-2">
//               <div className="relative">
//                 <div
//                   className="absolute left-0 right-0 top-0 flex items-center"
//                   aria-hidden="true"
//                 >
//                   <div className="w-full border-t border-gray-100" />
//                 </div>
//                 <div className="relative mt-4 flex justify-center">
//                   <p className="text-sm text-gray-500">
//                     Don't have an account?
//                     <a
//                       href="/Signup"
//                       className="ml-2 text-indigo-600 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-200 rounded"
//                     >
//                       Sign Up
//                     </a>
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;



import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { loginUser } from "@/authSlice";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import glogo from "../assets/google_logo.png"

// validation schema
const signupSchema = z.object({
  emailId: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password should contain at least 6 characters"),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  function onSubmit(data) {
    dispatch(loginUser(data));
  }


  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
      {/* --- Navbar --- */}
      <div className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
        <nav className="flex items-center justify-between px-6 py-4 max-w-[1400px] mx-auto w-full">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="text-[#4ADE80] group-hover:scale-110 transition-transform duration-300">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17l-4-4 4-4" />
                <path d="M17 17l4-4-4-4" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              codeup
            </span>
          </div>

          <div className="text-sm text-gray-400">
            Don't have an account?
            <button
              onClick={() => navigate("/signup")}
              className="ml-2 text-[#4ADE80] font-semibold hover:underline"
            >
              Sign Up
            </button>
          </div>
        </nav>
      </div>

      {/* --- Main Content Area --- */}
      <main className="grow flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[420px] bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm">
              Please enter your credentials to access your account
            </p>
          </div>

          {/* Google Button */}
          <button 
            type="button" 
            // onClick={handleGoogleSignup}
            className="w-full bg-[#1A1A1A] hover:bg-[#252525] text-white py-3 rounded-lg border border-white/10 flex items-center justify-center gap-3 transition-colors font-medium"
          >
            <img src={glogo} alt="Google" width="20" height="20" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex py-4 items-center">
             <div className="grow border-t border-white/10"></div>
             <span className="shrink mx-4 text-gray-500 text-xs uppercase">Or</span>
             <div className="grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="emailId"
                className="text-sm font-medium text-gray-300 ml-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  id="emailId"
                  type="email"
                  {...register("emailId")}
                  placeholder="name@example.com"
                  className={`w-full bg-[#0a0a0a] border rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80] transition-all ${
                    errors.emailId ? "border-red-500" : "border-white/10"
                  }`}
                />
              </div>
              {errors.emailId && (
                <p className="text-xs text-red-400 ml-1">
                  {errors.emailId.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300 ml-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className={`w-full bg-[#0a0a0a] border rounded-lg py-3 pl-10 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80] transition-all ${
                    errors.password ? "border-red-500" : "border-white/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4ADE80] text-black font-bold text-lg py-3 rounded-lg hover:bg-[#3ec46d] transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_25px_rgba(74,222,128,0.5)] flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                "Submitting..."
              ) : (
                <>
                  Log In <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;