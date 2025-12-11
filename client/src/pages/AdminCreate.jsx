import axiosClient from "@/utils/axiosClient";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { 
  Save, 
  Plus, 
  Trash2, 
  Code2, 
  ArrowLeft, 
  Layout, 
  Eye, 
  EyeOff,
  FileCode
} from "lucide-react";

const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    required_error: "Difficulty is required",
  }),
  tags: z.enum(
    [
      "Array", "Hashmap", "Linked List", "Math", "Recursion", 
      "Sorting", "Stack", "String", "Tree",
    ],
    { required_error: "Tags are required" }
  ),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explanation: z.string().min(1, "Explanation is required"),
    })
  ).min(1, "At least one visible test case is required"),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
    })
  ).min(1, "At least one hidden test case is required"),
  startCode: z.array(
    z.object({
      language: z.enum(["c++", "java", "javascript"]),
      initialCode: z.string().min(1, "Initial code is required"),
    })
  ).length(3, "All 3 languages are required"),
  referenceSolution: z.array(
    z.object({
      language: z.enum(["c++", "java", "javascript"]),
      completeCode: z.string().min(1, "Complete code is required"),
    })
  ).length(3, "All 3 languages are required"),
});

const AdminCreate = () => {
  const navigate = useNavigate();
  
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "Easy",
      tags: "Array",
      visibleTestCases: [
        { input: "", output: "", explanation: "" },
      ],
      hiddenTestCases: [{ input: "", output: "" }],
      startCode: [
        { language: "c++", initialCode: "// Write your C++ code here..." },
        { language: "java", initialCode: "// Write your Java code here..." },
        { language: "javascript", initialCode: "// Write your JS code here..." },
      ],
      referenceSolution: [
        { language: "c++", completeCode: "" },
        { language: "java", completeCode: "" },
        { language: "javascript", completeCode: "" },
      ],
    }
  });
  
  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({
    control,
    name: "visibleTestCases",
  });
  
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({
    control,
    name: "hiddenTestCases",
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/problem/create', data);
      // alert("Problem created successfully!"); // Replaced with better UI feedback if possible, or keep simple
      navigate('/');
    } catch(err){
      alert(err.response?.data?.message || "Something went wrong");
    }
  }

  // Reusable Input Style
  const inputStyle = "w-full bg-[#161b22] border border-white/10 rounded-lg px-4 py-2.5 text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-600";
  const labelStyle = "block text-sm font-medium text-gray-400 mb-1.5";
  const sectionTitle = "text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-2";

  return (
    <div 
      className="min-h-screen text-gray-200 font-sans selection:bg-indigo-500/50"
      
    >
      <div className="min-h-screen bg-black/40 backdrop-blur-[2px] py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <ArrowLeft size={20} className="text-gray-300" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Create New Problem</h1>
              <p className="text-sm text-gray-400">Add a new coding challenge to the database.</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto space-y-8">
          
          {/* 1. Basic Information Card */}
          <div className="bg-[#161b22]/60 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
            <h2 className={sectionTitle}><Layout size={18} className="text-indigo-400" /> Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className={labelStyle}>Problem Title</label>
                <input 
                  {...register("title")} 
                  placeholder="e.g. Two Sum" 
                  className={inputStyle} 
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>

              {/* Difficulty */}
              <div>
                <label className={labelStyle}>Difficulty</label>
                <select {...register("difficulty")} className={inputStyle}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                {errors.difficulty && <p className="text-red-400 text-xs mt-1">{errors.difficulty.message}</p>}
              </div>

              {/* Tags */}
              <div>
                <label className={labelStyle}>Topic Tag</label>
                <select {...register("tags")} className={inputStyle}>
                  <option value="Array">Array</option>
                  <option value="Hashmap">Hashmap</option>
                  <option value="Linked List">Linked List</option>
                  <option value="Math">Math</option>
                  <option value="Recursion">Recursion</option>
                  <option value="Sorting">Sorting</option>
                  <option value="Stack">Stack</option>
                  <option value="String">String</option>
                  <option value="Tree">Tree</option>
                </select>
                {errors.tags && <p className="text-red-400 text-xs mt-1">{errors.tags.message}</p>}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className={labelStyle}>Description</label>
                <textarea 
                  {...register("description")} 
                  rows={6} 
                  placeholder="Detailed problem description..." 
                  className={`${inputStyle} resize-y`} 
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* 2. Test Cases Card */}
          <div className="bg-[#161b22]/60 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
            <h2 className={sectionTitle}><Code2 size={18} className="text-indigo-400" /> Test Cases</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Visible Test Cases */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <Eye size={16} className="text-green-400"/> Public Cases
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => appendVisible({ input: "", output: "", explanation: "" })}
                    className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                  >
                    <Plus size={14} /> Add Case
                  </button>
                </div>

                {visibleFields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-black/20 rounded-lg border border-white/5 relative group">
                    <button 
                      type="button" 
                      onClick={() => removeVisible(index)}
                      className="absolute top-2 right-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="space-y-3">
                      <input {...register(`visibleTestCases.${index}.input`)} placeholder="Input (e.g. nums = [2,7,11,15], target = 9)" className={inputStyle} />
                      {errors.visibleTestCases?.[index]?.input && <p className="text-red-400 text-xs">{errors.visibleTestCases[index].input.message}</p>}
                      
                      <input {...register(`visibleTestCases.${index}.output`)} placeholder="Output (e.g. [0,1])" className={inputStyle} />
                      {errors.visibleTestCases?.[index]?.output && <p className="text-red-400 text-xs">{errors.visibleTestCases[index].output.message}</p>}
                      
                      <textarea {...register(`visibleTestCases.${index}.explanation`)} rows={2} placeholder="Explanation..." className={inputStyle} />
                      {errors.visibleTestCases?.[index]?.explanation && <p className="text-red-400 text-xs">{errors.visibleTestCases[index].explanation.message}</p>}
                    </div>
                  </div>
                ))}
                {errors.visibleTestCases && <p className="text-red-400 text-xs">{errors.visibleTestCases.message}</p>}
              </div>

              {/* Hidden Test Cases */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <EyeOff size={16} className="text-orange-400"/> Hidden Cases
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => appendHidden({ input: "", output: "" })}
                    className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                  >
                    <Plus size={14} /> Add Case
                  </button>
                </div>

                {hiddenFields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-black/20 rounded-lg border border-white/5 relative group">
                    <button 
                      type="button" 
                      onClick={() => removeHidden(index)}
                      className="absolute top-2 right-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="space-y-3">
                      <input {...register(`hiddenTestCases.${index}.input`)} placeholder="Input" className={inputStyle} />
                      {errors.hiddenTestCases?.[index]?.input && <p className="text-red-400 text-xs">{errors.hiddenTestCases[index].input.message}</p>}
                      
                      <input {...register(`hiddenTestCases.${index}.output`)} placeholder="Output" className={inputStyle} />
                      {errors.hiddenTestCases?.[index]?.output && <p className="text-red-400 text-xs">{errors.hiddenTestCases[index].output.message}</p>}
                    </div>
                  </div>
                ))}
                {errors.hiddenTestCases && <p className="text-red-400 text-xs">{errors.hiddenTestCases.message}</p>}
              </div>
            </div>
          </div>

          {/* 3. Code Configuration Card */}
          <div className="bg-[#161b22]/60 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
             <h2 className={sectionTitle}><FileCode size={18} className="text-indigo-400" /> Boilerplate & Solutions</h2>
             
             {/* Starter Code */}
             <div className="mb-8">
               <h3 className="text-sm font-semibold text-gray-300 mb-4">Starter Code (User's starting point)</h3>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {["c++", "java", "javascript"].map((lang, idx) => (
                    <div key={`start-${lang}`} className="space-y-2">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-xs font-mono text-indigo-300 uppercase">{lang}</span>
                      </div>
                      <textarea 
                        {...register(`startCode.${idx}.initialCode`)}
                        className={`${inputStyle} font-mono text-sm min-h-[150px]`}
                        placeholder={`// Initial ${lang} code`}
                      />
                       {errors.startCode?.[idx]?.initialCode && <p className="text-red-400 text-xs">{errors.startCode[idx].initialCode.message}</p>}
                    </div>
                  ))}
               </div>
             </div>

             {/* Reference Solution */}
             <div>
               <h3 className="text-sm font-semibold text-gray-300 mb-4">Reference Solution (For validation)</h3>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {["c++", "java", "javascript"].map((lang, idx) => (
                    <div key={`ref-${lang}`} className="space-y-2">
                      <div className="flex justify-between items-center px-2">
                         <span className="text-xs font-mono text-emerald-400 uppercase">{lang}</span>
                      </div>
                      <textarea 
                        {...register(`referenceSolution.${idx}.completeCode`)}
                        className={`${inputStyle} font-mono text-sm min-h-[150px]`}
                        placeholder={`// Complete ${lang} solution`}
                      />
                      {errors.referenceSolution?.[idx]?.completeCode && <p className="text-red-400 text-xs">{errors.referenceSolution[idx].completeCode.message}</p>}
                    </div>
                  ))}
               </div>
             </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-4 pb-20">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <Save size={20} /> Create Problem
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminCreate;