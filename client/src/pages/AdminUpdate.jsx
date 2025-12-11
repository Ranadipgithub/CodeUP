import axiosClient from "@/utils/axiosClient";
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Search, 
  FileEdit, 
  LayoutList,
  FileCode 
} from "lucide-react";
import backgroundImage from "../assets/bg.png";

const AdminUpdate = () => {
  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosClient.get("/problem/getAllProblem");
        const data = response.data;
        const problemsArray = Array.isArray(data) ? data : data.problems || [];
        setProblems(problemsArray);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper for difficulty colors
  const getDifficultyColor = (diff) => {
    const d = diff?.toLowerCase() || "";
    if (d === "easy") return "text-green-400 bg-green-400/10 border-green-400/20";
    if (d === "medium") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    if (d === "hard") return "text-red-400 bg-red-400/10 border-red-400/20";
    return "text-gray-400 bg-gray-400/10 border-gray-400/20";
  };

  const filteredProblems = problems.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="min-h-screen text-gray-200 font-sans selection:bg-indigo-500/50"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundColor: "#0F111A",
      }}
    >
      <div className="min-h-screen bg-black/40 backdrop-blur-[2px] py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 self-start sm:self-auto">
            <Link
              to="/admin"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-300" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Update Problems</h1>
              <p className="text-sm text-gray-400">
                Modify existing challenges and test cases.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-[#161b22] border border-white/10 rounded-lg text-sm placeholder-gray-500 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center text-gray-500 py-20">Loading problems...</div>
          ) : filteredProblems.length === 0 ? (
            <div className="text-center text-gray-500 py-20 bg-[#161b22]/50 rounded-xl border border-white/5">
              <LayoutList size={48} className="mx-auto mb-4 opacity-20" />
              <p>No problems found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProblems.map((problem) => (
                <div
                  key={problem._id}
                  className="group bg-[#161b22]/60 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-amber-500/30 transition-all hover:shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className={`text-xs px-2 py-0.5 rounded border font-medium ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </div>
                      <FileCode size={16} className="text-gray-600 group-hover:text-amber-400 transition-colors" />
                    </div>
                    
                    <h2 className="text-lg font-semibold text-white mb-2 line-clamp-1" title={problem.title}>
                      {problem.title}
                    </h2>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                      {problem.description}
                    </p>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-white/5">
                    <button
                      onClick={() => navigate(`/admin/update/${problem._id}`)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20 transition-all text-sm font-medium w-full justify-center sm:w-auto"
                    >
                      <FileEdit size={14} /> Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUpdate;