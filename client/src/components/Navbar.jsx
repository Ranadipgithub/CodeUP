import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router"; // 1. Import useLocation
import { User, LogOut } from "lucide-react";
import { logoutUser } from "@/authSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 2. Get current location
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  // 3. Define Nav Items with their specific paths
  const navItems = [
    { name: "Problems", path: "/problems" },
    { name: "Contests", path: "/contests" },
    { name: "Discuss", path: "/discuss" },
  ];

  const avatar = user?.avatar;

  return (
    <div className="bg-[#050505] text-white font-sans selection:bg-[#4ADE80] selection:text-black overflow-x-hidden relative flex flex-col">
      <div className="relative z-50 w-full border-b border-white/10 bg-[#050505]/50 backdrop-blur-sm">
        <nav className="flex items-center justify-between px-6 py-5 max-w-[1300px] mx-auto w-full">
          {/* Logo */}
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
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17l-4-4 4-4" />
                <path d="M17 17l4-4-4-4" />
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">
              codeup
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-10 text-[18px] font-medium">
            {navItems.map((item) => {
              // 4. Check if this link is active
              const isActive = location.pathname === item.path;

              return (
                <div
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1 cursor-pointer transition-colors group relative ${
                    isActive ? "text-white" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {item.name}
                  {/* 5. Conditional Styling for the underline */}
                  <span
                    className={`absolute -bottom-6 left-0 w-full h-0.5 bg-[#4ADE80] transition-transform origin-left ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></span>
                </div>
              );
            })}

            {/* Static Links */}
            <a
              href="#"
              className="text-[#ffa116] hover:text-white transition-colors"
            >
              Premium
            </a>
            <a
              href="/admin"
              className="text-[#4ADE80] hover:text-white transition-colors"
            >
              {user && user.role === "admin" && "Admin"}
            </a>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              // --- Authenticated View ---
              <>
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 text-red-400 hover:text-red-500 transition-colors text-md font-medium cursor-pointer"
                >
                  <LogOut size={18} />
                  Logout
                </button>

                {/* User Icon / Profile Trigger */}
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => navigate("/profile")}
                >
                  <span className="hidden lg:block text-md font-medium text-white">
                    {user?.firstName || "User"}
                  </span>

                  <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden flex items-center justify-center bg-[#1A1A1A] group-hover:border-[#4ADE80] group-hover:shadow-[0_0_10px_rgba(74,222,128,0.2)] transition-all">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer" // important for Google avatars
                      />
                    ) : (
                      <User size={20} className="text-[#4ADE80]" />
                    )}
                  </div>
                </div>
              </>
            ) : (
              // --- Unauthenticated View ---
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-white font-semibold hover:text-gray-300 text-[18px] cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-[#4ADE80] text-black px-7 py-3 rounded font-bold hover:bg-[#3ec46d] transition-all text-[18px] cursor-pointer shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
