import axiosClient from "@/utils/axiosClient";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, Link, useParams } from "react-router-dom";
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
  FileCode,
} from "lucide-react";
import backgroundImage from "../assets/bg.png";

const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    required_error: "Difficulty is required",
  }),
  tags: z.enum(
    [
      "Array",
      "Hashmap",
      "Linked List",
      "Math",
      "Recursion",
      "Sorting",
      "Stack",
      "String",
      "Tree",
    ],
    { required_error: "Tags are required" }
  ),
  visibleTestCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
        explanation: z.string().min(1, "Explanation is required"),
      })
    )
    .min(1, "At least one visible test case is required"),
  hiddenTestCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
      })
    )
    .min(1, "At least one hidden test case is required"),
  startCode: z
    .array(
      z.object({
        language: z.enum(["c++", "java", "javascript"]),
        initialCode: z.string().min(1, "Initial code is required"),
      })
    )
    .length(3, "All 3 languages are required"),
  referenceSolution: z
    .array(
      z.object({
        language: z.enum(["c++", "java", "javascript"]),
        completeCode: z.string().min(1, "Complete code is required"),
      })
    )
    .length(3, "All 3 languages are required"),
});

const UpdateProblem = () => {
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(problemSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosClient.get(
          `/problem/problemById/allInfo/${problemId}`
        );
        const data = response.data.problem;
        setProblem(data);

        // Define the strict order and casing required by Zod
        const orderedLanguages = ["c++", "java", "javascript"];

        // --- FIX STARTS HERE ---
        // We explicitly construct a NEW object. 
        // We do NOT return the DB object directly.
        // This ensures 'language' is always exactly what Zod expects (e.g. 'javascript', not 'JavaScript').

        const normalizedStartCode = orderedLanguages.map((lang) => {
          const found = data.startCode.find(
            (item) => item.language.toLowerCase() === lang
          );
          return {
            language: lang, // FORCE the lowercase value from our array
            initialCode: found ? found.initialCode : "",
          };
        });

        const normalizedReferenceSolution = orderedLanguages.map((lang) => {
          const found = data.referenceSolution.find(
            (item) => item.language.toLowerCase() === lang
          );
          return {
            language: lang, // FORCE the lowercase value
            completeCode: found ? found.completeCode : "",
          };
        });
        // --- FIX ENDS HERE ---

        reset({
          title: data.title,
          description: data.description,
          difficulty: data.difficulty,
          tags: data.tags,
          visibleTestCases: data.visibleTestCases,
          hiddenTestCases: data.hiddenTestCases,
          startCode: normalizedStartCode,
          referenceSolution: normalizedReferenceSolution,
        });
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [problemId, reset]);

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible,
  } = useFieldArray({
    control,
    name: "visibleTestCases",
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
  } = useFieldArray({
    control,
    name: "hiddenTestCases",
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.put(`/problem/update/${problemId}`, data);
      navigate("/admin");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  // ADDED: Error handler to see validation errors in console
  const onError = (errors) => {
    console.log("Validation Errors:", errors);
    alert("Please check the form for errors.");
  };

  const inputStyle =
    "w-full bg-[#161b22] border border-white/10 rounded-lg px-4 py-2.5 text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-600";
  const labelStyle = "block text-sm font-medium text-gray-400 mb-1.5";
  const sectionTitle =
    "text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-2";

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
        <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-300" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Update Problem</h1>
              <p className="text-sm text-gray-400">
                {problem && problem.title}
              </p>
            </div>
          </div>
        </div>

        {/* Added onError to handleSubmit to catch validation issues */}
        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          className="max-w-5xl mx-auto space-y-8"
        >
          {/* 1. Basic Info */}
          <div className="bg-[#161b22]/60 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
            <h2 className={sectionTitle}>
              <Layout size={18} className="text-indigo-400" /> Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelStyle}>Problem Title</label>
                <input
                  {...register("title")}
                  placeholder="e.g. Two Sum"
                  className={inputStyle}
                />
                {errors.title && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelStyle}>Difficulty</label>
                <select {...register("difficulty")} className={inputStyle}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

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
              </div>

              <div className="md:col-span-2">
                <label className={labelStyle}>Description</label>
                <textarea
                  {...register("description")}
                  rows={6}
                  placeholder="Detailed problem description..."
                  className={`${inputStyle} resize-y`}
                />
                {errors.description && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Test Cases */}
          <div className="bg-[#161b22]/60 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
            <h2 className={sectionTitle}>
              <Code2 size={18} className="text-indigo-400" /> Test Cases
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Visible Cases */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <Eye size={16} className="text-green-400" /> Public Cases
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      appendVisible({ input: "", output: "", explanation: "" })
                    }
                    className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                  >
                    <Plus size={14} /> Add Case
                  </button>
                </div>

                {visibleFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 bg-black/20 rounded-lg border border-white/5 relative group"
                  >
                    <button
                      type="button"
                      onClick={() => removeVisible(index)}
                      className="absolute top-2 right-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="space-y-3">
                      <input
                        {...register(`visibleTestCases.${index}.input`)}
                        placeholder="Input"
                        className={inputStyle}
                      />
                      <input
                        {...register(`visibleTestCases.${index}.output`)}
                        placeholder="Output"
                        className={inputStyle}
                      />
                      <textarea
                        {...register(`visibleTestCases.${index}.explanation`)}
                        rows={2}
                        placeholder="Explanation"
                        className={inputStyle}
                      />
                    </div>
                  </div>
                ))}
                {errors.visibleTestCases && (
                  <p className="text-red-400 text-xs">
                    {errors.visibleTestCases.message}
                  </p>
                )}
              </div>

              {/* Hidden Cases */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <EyeOff size={16} className="text-orange-400" /> Hidden
                    Cases
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
                  <div
                    key={field.id}
                    className="p-4 bg-black/20 rounded-lg border border-white/5 relative group"
                  >
                    <button
                      type="button"
                      onClick={() => removeHidden(index)}
                      className="absolute top-2 right-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="space-y-3">
                      <input
                        {...register(`hiddenTestCases.${index}.input`)}
                        placeholder="Input"
                        className={inputStyle}
                      />
                      <input
                        {...register(`hiddenTestCases.${index}.output`)}
                        placeholder="Output"
                        className={inputStyle}
                      />
                    </div>
                  </div>
                ))}
                {errors.hiddenTestCases && (
                  <p className="text-red-400 text-xs">
                    {errors.hiddenTestCases.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 3. Code Configuration */}
          <div className="bg-[#161b22]/60 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
            <h2 className={sectionTitle}>
              <FileCode size={18} className="text-indigo-400" /> Boilerplate & Solutions
            </h2>

            {/* Starter Code */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">
                Starter Code (User's starting point)
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {["c++", "java", "javascript"].map((lang, idx) => (
                  <div key={`start-${lang}`} className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                      <span className="text-xs font-mono text-indigo-300 uppercase">
                        {lang}
                      </span>
                    </div>
                    {/* CRITICAL FIX: Registering the Language field as Hidden Input */}
                    <input 
                      type="hidden" 
                      value={lang} 
                      {...register(`startCode.${idx}.language`)} 
                    />
                    
                    <textarea
                      {...register(`startCode.${idx}.initialCode`)}
                      className={`${inputStyle} font-mono text-sm min-h-[150px]`}
                      placeholder={`// Initial ${lang} code`}
                    />
                    {errors.startCode?.[idx]?.initialCode && (
                      <p className="text-red-400 text-xs">
                        {errors.startCode[idx].initialCode.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reference Solution */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-4">
                Reference Solution (For validation)
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {["c++", "java", "javascript"].map((lang, idx) => (
                  <div key={`ref-${lang}`} className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                      <span className="text-xs font-mono text-emerald-400 uppercase">
                        {lang}
                      </span>
                    </div>
                    {/* CRITICAL FIX: Registering the Language field as Hidden Input */}
                    <input 
                      type="hidden" 
                      value={lang} 
                      {...register(`referenceSolution.${idx}.language`)} 
                    />

                    <textarea
                      {...register(`referenceSolution.${idx}.completeCode`)}
                      className={`${inputStyle} font-mono text-sm min-h-[150px]`}
                      placeholder={`// Complete ${lang} solution`}
                    />
                    {errors.referenceSolution?.[idx]?.completeCode && (
                      <p className="text-red-400 text-xs">
                        {errors.referenceSolution[idx].completeCode.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

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
                  <Save size={20} /> Update Problem
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProblem;