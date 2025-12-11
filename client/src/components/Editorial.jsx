import React, { useEffect, useState } from "react";
import {
  Clock,
  AlertCircle,
  FileVideo,
  MonitorPlay,
  Loader2,
  Lightbulb
} from "lucide-react";
import axiosClient from "@/utils/axiosClient";

const Editorial = ({ problemId }) => {
  const [videoData, setVideoData] = useState({
    secureUrl: "",
    thumbnailUrl: "",
    duration: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoInfo = async () => {
      if (!problemId) return;

      setLoading(true);
      try {
        const response = await axiosClient.get(`/video/get/${problemId}`);

        const video = response.data.video || {};

        const newVideoData = {
          secureUrl: video.secureUrl || "",
          thumbnailUrl: video.thumbnailUrl || "",
          duration: video.duration || 0,
        };

        setVideoData(newVideoData);
      } catch (error) {
        console.error("Error fetching video info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoInfo();
  }, [problemId]);

  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // --- 1. Loading State ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-white/5 rounded-xl bg-[#121212] mt-4">
        <Loader2 className="animate-spin text-[#4ADE80] mb-3" size={32} />
        <p className="text-gray-400 text-sm font-medium">Loading solution...</p>
      </div>
    );
  }

  // --- 2. Empty State ---
  if (!videoData.secureUrl) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-white/10 rounded-xl bg-[#121212] mt-4">
        <div className="w-16 h-16 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-4 border border-white/5 group">
          <FileVideo className="text-gray-600 group-hover:text-[#4ADE80] transition-colors" size={28} />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">
          No Editorial Available
        </h3>
        <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
          The author hasn't uploaded a video solution for this problem yet.
        </p>
      </div>
    );
  }

  // --- 3. Video Player UI ---
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <div className="p-1.5 bg-[#4ADE80]/10 rounded-md border border-[#4ADE80]/20">
            <MonitorPlay size={18} className="text-[#4ADE80]" />
          </div>
          Video Editorial
        </h2>

        {videoData.duration > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1A1A1A] border border-white/10 text-xs text-[#4ADE80] font-mono shadow-sm">
            <Clock size={12} />
            <span>{formatDuration(videoData.duration)}</span>
          </div>
        )}
      </div>

      {/* Player Container */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl group">
        <video
          key={videoData.secureUrl}
          controls
          className="w-full h-full object-contain"
          poster={videoData.thumbnailUrl}
          preload="metadata"
        >
          <source src={videoData.secureUrl} type="video/mp4" />
          <source src={videoData.secureUrl} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Helpful Tip / Context */}
      <div className="p-5 rounded-xl bg-[#121212] border border-[#4ADE80]/20 flex gap-4 items-start relative overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ADE80]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>

        <div className="p-2 bg-[#4ADE80]/10 rounded-lg shrink-0">
             <Lightbulb size={20} className="text-[#4ADE80]" />
        </div>
        
        <div className="space-y-1 relative z-10">
          <p className="text-sm text-white font-semibold">Learning Tip</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            We recommend attempting the problem yourself for at least{" "}
            <span className="text-[#4ADE80] font-medium">15-20 minutes</span> before watching the editorial. This
            helps build problem-solving intuition!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Editorial;