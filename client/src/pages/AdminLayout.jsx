import AdminDashboard from "@/components/AdminDashboard";
import AdminProblem from "@/components/AdminProblem";
import AdminUsers from "@/components/AdminUsers";
import { LayoutDashboard, ListPlus, LogOutIcon, Users } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router";


const AdminLayout = () => {
  const [currentView, setCurrentView] = useState("admin-dashboard");
  const navigate = useNavigate();

  // --- Render Logic ---
  const renderContent = () => {
    switch (currentView) {
      case "admin-dashboard":
        return <AdminDashboard />;
      case "admin-users":
        return <AdminUsers />;
      case "admin-problems":
        return <AdminProblem />; // Assuming this component handles the list/management of problems
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#121212] border-r border-white/10 flex flex-col shrink-0">
        <div
          className="h-[70px] flex items-center px-6 border-b border-white/10 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="text-[#4ADE80] mr-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M7 17l-4-4 4-4" />
              <path d="M17 17l4-4-4-4" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            codeup
          </span>
          <span className="ml-2 text-xs bg-[#2A2A2A] text-gray-400 px-1.5 py-0.5 rounded border border-white/10">
            ADMIN
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            {
              id: "admin-dashboard",
              label: "Dashboard",
              icon: LayoutDashboard,
            },
            { id: "admin-users", label: "Manage Users", icon: Users },
            { id: "admin-problems", label: "Problems", icon: ListPlus },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                                ${
                                  currentView === item.id ||
                                  (currentView === "admin-create-problem" &&
                                    item.id === "admin-problems")
                                    ? "bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                                }
                            `}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOutIcon size={18} /> Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#050505] p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminLayout;