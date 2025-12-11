import axiosClient from "@/utils/axiosClient";
import axios from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  UploadCloud, 
  FileVideo, 
  CheckCircle2, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import backgroundImage from "../assets/bg.png"; // Ensure path is correct

const AdminUpload = () => {
  const { problemId } = useParams();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors
  } = useForm();

  // Watch for file selection to show filename
  const selectedFile = watch("videoFile");

  const onSubmit = async (data) => {
    const file = data.videoFile[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    clearErrors();

    try {
        // 1. Get signature
        const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
        const { signature, timestamp, public_id, api_key, upload_url } = signatureResponse.data;

        // 2. Prepare Form Data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);
        formData.append('public_id', public_id);
        formData.append('api_key', api_key);

        // 3. Upload to Cloudinary
        const uploadResponse = await axios.post(upload_url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
            }
        });

        const cloudinaryResult = uploadResponse.data;

        // 4. Save Metadata
        const metaDataResponse = await axiosClient.post('/video/save', {
            problemId,
            cloudinaryPublicId: cloudinaryResult.public_id,
            secureUrl: cloudinaryResult.secure_url,
            duration: cloudinaryResult.duration,
        });

        setUploadedVideo(metaDataResponse.data.videoSolution);
        setUploading(false);
        reset();
    } catch (err) {
        console.error(err);
        setUploading(false);
        setError('videoFile', { 
            type: "manual", 
            message: err.response?.data?.message || "Upload failed. Please try again." 
        });
    }
  };

  return (
    <div 
      className="min-h-screen text-gray-200 font-sans selection:bg-indigo-500/50"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: '#0F111A' 
      }}
    >
      <div className="min-h-screen bg-black/40 backdrop-blur-[2px] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        
        {/* Header */}
        <div className="w-full max-w-lg mb-8 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Admin</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-lg bg-[#161b22]/80 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Upload Editorial Video</h1>
            <p className="text-gray-400 text-sm">Upload a video explanation for Problem ID: <span className="font-mono text-indigo-400">{problemId}</span></p>
          </div>

          {!uploadedVideo ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Drag & Drop Area Visual */}
              <div className="relative group">
                <input
                  {...register("videoFile", { 
                    required: "Please select a video file",
                    validate: {
                        lessThan100MB: (files) => files[0]?.size < 100000000 || "Max 100MB",
                        acceptedFormats: (files) => 
                          ['video/mp4', 'video/webm', 'video/mkv'].includes(files[0]?.type) || "Only MP4, WebM, MKV"
                    }
                  })}
                  type="file"
                  accept="video/*"
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer disabled:cursor-not-allowed"
                />
                
                <div className={`
                  border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300
                  ${errors.videoFile 
                    ? "border-red-500/50 bg-red-500/5" 
                    : "border-white/10 bg-white/5 group-hover:border-indigo-500/50 group-hover:bg-white/10"
                  }
                `}>
                  {selectedFile && selectedFile.length > 0 ? (
                    <>
                      <FileVideo size={48} className="text-indigo-400 mb-4" />
                      <p className="text-white font-medium text-sm break-all">
                        {selectedFile[0].name}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {(selectedFile[0].size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={48} className="text-gray-500 mb-4 group-hover:text-indigo-400 transition-colors" />
                      <p className="text-gray-300 font-medium text-sm">
                        Click to upload or drag video here
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        MP4, WebM up to 100MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {errors.videoFile && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle size={16} />
                  <span>{errors.videoFile.message}</span>
                </div>
              )}

              {/* Progress Bar */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading}
                className={`
                  w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
                  ${uploading 
                    ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5" 
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/25"
                  }
                `}
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>Upload Video</>
                )}
              </button>
            </form>
          ) : (
            // Success State
            <div className="flex flex-col items-center justify-center py-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-400 border border-green-500/30">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Upload Successful!</h2>
              <p className="text-gray-400 text-sm text-center mb-6">
                Your editorial video has been processed and linked to the problem.
              </p>
              
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => {
                    setUploadedVideo(null);
                    setUploadProgress(0);
                    reset();
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium border border-white/10 transition-colors"
                >
                  Upload Another
                </button>
                <Link 
                  to="/admin"
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium text-center transition-colors shadow-lg"
                >
                  Done
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;