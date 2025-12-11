import axiosClient from "@/utils/axiosClient";
import { Edit, Plus, Trash2, Video, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const AdminProblem = () => {
  const [problems, setProblems] = useState([]);
  const [videoIds, setVideoIds] = useState(new Set()); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Parallel fetch
        const [problemsRes, videosRes] = await Promise.all([
          axiosClient.get("/problem/getAllProblem"),
          axiosClient.get("/video/allVideoIds")
        ]);

        setProblems(problemsRes.data.problems || []);
        
        // --- FIX IS HERE ---
        // 1. Get the 'videos' array from the response object
        const videoList = videosRes.data.videos || [];
        
        // 2. Map over the array to extract ONLY the 'problemId'
        const existingProblemIds = videoList.map(video => video.problemId);
        
        // 3. Create the Set using the extracted problemIds
        setVideoIds(new Set(existingProblemIds));
        
        setLoading(false);
      } catch (err) {
        console.log("Error fetching data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (problemId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this problem?"))
        return;
      await axiosClient.delete(`/problem/delete/${problemId}`);
      setProblems(problems.filter((problem) => problem._id !== problemId));
    } catch (err) {
      console.log(err);
      alert("Failed to delete problem");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-white bg-black">
        <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="h-4 w-4 bg-[#4ADE80] rounded-full animate-bounce"></div>
            <span className="text-gray-400 text-sm">Loading dashboard...</span>
        </div>
    </div>
  );

  return (
    <div className="animate-fade-in max-w-7xl mx-auto p-6 min-h-screen text-gray-200">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white mb-1">Problems</h1>
            <p className="text-gray-400 text-sm">Manage coding challenges and video solutions.</p>
        </div>
        <button
          onClick={() => navigate("/admin/create")}
          className="bg-[#4ADE80] text-black px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-[#3ec46d] flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(74,222,128,0.2)] transform hover:-translate-y-0.5"
        >
          <Plus size={18} /> Create Problem
        </button>
      </div>

      <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1A1A1A] text-gray-400 text-xs uppercase font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4 border-b border-white/5">Title</th>
              <th className="px-6 py-4 border-b border-white/5">Difficulty</th>
              <th className="px-6 py-4 border-b border-white/5">Tags</th>
              <th className="px-6 py-4 border-b border-white/5">Solution</th>
              <th className="px-6 py-4 border-b border-white/5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-gray-300">
            {problems.map((prob) => {
                // Check if this problem's ID exists in our Set of video problemIds
                const hasVideo = videoIds.has(prob._id);
                
                return (
                  <tr
                    key={prob._id}
                    className="hover:bg-[#1A1A1A]/50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {prob.title}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-medium border
                                      ${
                                        prob.difficulty === "Easy"
                                          ? "text-[#00B8A3] bg-[#00B8A3]/10 border-[#00B8A3]/20"
                                          : prob.difficulty === "Medium"
                                          ? "text-[#FFC01E] bg-[#FFC01E]/10 border-[#FFC01E]/20"
                                          : "text-[#FF375F] bg-[#FF375F]/10 border-[#FF375F]/20"
                                      }
                                   `}
                      >
                        {prob.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-[#2A2A2A] px-2.5 py-1 rounded-full text-gray-400 border border-white/5">
                        {prob.tags}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {hasVideo ? (
                        <div className="flex items-center gap-1.5 text-[#4ADE80] text-xs font-bold bg-[#4ADE80]/10 px-2.5 py-1.5 rounded-md w-fit border border-[#4ADE80]/20 cursor-default">
                          <Video size={14} strokeWidth={2.5} /> Published
                        </div>
                      ) : (
                        <button 
                            onClick={() => navigate(`/admin/upload/${prob._id}`)}
                            className="flex items-center gap-1.5 text-gray-400 text-xs font-medium bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-md w-fit border border-white/10 hover:border-white/20 transition-all hover:text-white group/btn"
                        >
                          <Upload size={14} className="group-hover/btn:text-[#4ADE80] transition-colors" /> Upload Video
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/admin/update/${prob._id}`)}
                          className="p-2 hover:bg-blue-500/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                          title="Edit Problem"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(prob._id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete Problem"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
            })}
            {problems.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 bg-[#121212]">
                        No problems found. Click "Create Problem" to start.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProblem;