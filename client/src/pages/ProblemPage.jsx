import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosClient from "@/utils/axiosClient";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Play,
  Cloud,
  Code2,
  ChevronDown,
  RotateCcw,
  Maximize2,
  CheckCircle2,
  Terminal,
  FileText,
  Loader2,
  Clock,
  Database,
  History,
  X,
  Copy,
  XCircle,
  AlertTriangle,
  Check,
  User,
} from "lucide-react";
import ChatAI from "@/components/ChatAI";
import Editorial from "@/components/Editorial";
import { toast } from "sonner"; 

const LanguageSelector = ({ selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
  
    const languages = [
      { id: "javascript", label: "JavaScript" },
      { id: "cpp", label: "C++" },
      { id: "java", label: "Java" },
      { id: "python", label: "Python" },
    ];
  
    const currentLang = languages.find((l) => l.id === selected) || languages[0];
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-green-400/10 text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium border border-green-400/20 hover:bg-green-400/20 transition-all duration-200 active:scale-95"
        >
          <Code2 size={14} />
          {currentLang.label}
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
  
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-40 bg-[#1e1e2e] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => {
                  onChange(lang.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors duration-200 flex items-center justify-between ${
                  selected === lang.id
                    ? "bg-green-500/10 text-green-400"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {lang.label}
                {selected === lang.id && (
                  <Check size={12} className="animate-fade-in" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
};

const SubmissionModal = ({ isOpen, onClose, submission }) => {
    if (!isOpen || !submission) return null;
    const isAccepted = submission.status === "accepted";
  
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        ></div>
        <div className="relative w-full max-w-3xl bg-[#161b22] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d1117]">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-white">
                Submission History
              </h2>
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  isAccepted
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                {isAccepted ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                {isAccepted ? "Accepted" : "Wrong Answer"}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>
          <div className="relative h-[400px] w-full bg-[#1e1e2e]">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => navigator.clipboard.writeText(submission.code)}
                className="flex items-center gap-2 px-2 py-1 bg-white/10 text-xs text-gray-300 rounded hover:bg-white/20 border border-white/5 transition-all duration-200"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            <Editor
              height="100%"
              language={
                submission.language === "c++" ? "cpp" : submission.language
              }
              theme="vs-dark"
              value={submission.code}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          </div>
        </div>
      </div>
    );
};

const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
};

const ProblemPage = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const editorRef = useRef(null);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [leftWidth, setLeftWidth] = useState(45);
  const [isDragging, setIsDragging] = useState(false);

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Description");
  const [bottomTab, setBottomTab] = useState("Testcase");

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [runResults, setRunResults] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [runError, setRunError] = useState(null);
  const [activeTestCaseId, setActiveTestCaseId] = useState(0);

  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // --- RESIZE HANDLER ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth);
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // --- FETCH PROBLEM ---
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(
          `/problem/problemById/${problemId}`
        );
        const probData = response.data.problem;
        setProblem(probData);

        const savedData = JSON.parse(
          localStorage.getItem(`codeup_autosave_${problemId}`)
        ) || {};

        const lastUsedLang = savedData.lastUsed || "javascript";
        setSelectedLanguage(lastUsedLang);

        if (savedData[lastUsedLang]) {
          setCode(savedData[lastUsedLang]);
        } else {
          const apiLang = lastUsedLang === "cpp" ? "c++" : lastUsedLang;
          const starter = probData.startCode.find(
            (sc) => sc.language.toLowerCase() === apiLang.toLowerCase()
          );
          setCode(starter ? starter.initialCode : "// Write your code here");
        }
      } catch (err) {
        console.error("Error fetching problem:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  // --- AUTO SAVE ---
  useEffect(() => {
    if (!problemId || loading || !code) return;
    const timeoutId = setTimeout(() => {
      const savedData = JSON.parse(
        localStorage.getItem(`codeup_autosave_${problemId}`)
      ) || {};
      savedData[selectedLanguage] = code;
      savedData.lastUsed = selectedLanguage;
      localStorage.setItem(
        `codeup_autosave_${problemId}`,
        JSON.stringify(savedData)
      );
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [code, selectedLanguage, problemId, loading]);

  useEffect(() => {
    if (activeTab === "Submissions" && isAuthenticated) {
      const fetchSubmissions = async () => {
        setSubmissionsLoading(true);
        try {
          const { data } = await axiosClient.get(
            `/problem/submittedProblems/${problemId}`
          );
          setSubmissions(data.submissions || []);
        } catch (error) {
          console.error("Error fetching submissions:", error);
        } finally {
          setSubmissionsLoading(false);
        }
      };
      fetchSubmissions();
    }
  }, [activeTab, problemId, isAuthenticated]);

  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    const savedData = JSON.parse(
      localStorage.getItem(`codeup_autosave_${problemId}`)
    ) || {};

    if (savedData[newLang]) {
      setCode(savedData[newLang]);
    } else if (problem && problem.startCode) {
      const apiLang = newLang === "cpp" ? "c++" : newLang;
      const starter = problem.startCode.find(
        (sc) => sc.language.toLowerCase() === apiLang.toLowerCase()
      );
      setCode(
        starter
          ? starter.initialCode
          : `// No starter code available for ${newLang}`
      );
    }
  };

  const handleResetCode = () => {
    if (problem && problem.startCode) {
      const apiLang = selectedLanguage === "cpp" ? "c++" : selectedLanguage;
      const starter = problem.startCode.find(
        (sc) => sc.language.toLowerCase() === apiLang.toLowerCase()
      );
      const originalCode = starter ? starter.initialCode : "";
      setCode(originalCode);
      const savedData = JSON.parse(localStorage.getItem(`codeup_autosave_${problemId}`)) || {};
      savedData[selectedLanguage] = originalCode;
      localStorage.setItem(`codeup_autosave_${problemId}`, JSON.stringify(savedData));
    }
  };

  const getApiLangName = (monacoLang) => {
    if (monacoLang === "cpp") return "c++";
    return monacoLang;
  };

  const handleRun = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to run code", {
        className: "bg-red-500/10 text-red-400 border border-red-500/20", 
      });
      return;
    }

    setIsRunning(true);
    setRunResults(null);
    setSubmitResult(null);
    setRunError(null);
    try {
      const payload = {
        language: getApiLangName(selectedLanguage),
        code: code,
      };
      const { data } = await axiosClient.post(
        `/submission/run/${problemId}`,
        payload
      );
      setRunResults(data);
      setBottomTab("Result");
      setActiveTestCaseId(0);
    } catch (error) {
      console.error("Run failed:", error);
      setRunError(
        error.response?.data?.message || "Compilation or Runtime Error"
      );
      setBottomTab("Result");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to submit code", {
        className: "bg-red-500/10 text-red-400 border border-red-500/20",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);
    setRunResults(null);
    setRunError(null);
    try {
      const payload = {
        language: getApiLangName(selectedLanguage),
        code: code,
      };
      const { data } = await axiosClient.post(
        `/submission/submit/${problemId}`,
        payload
      );
      setSubmitResult(data.submittedResult);
      setBottomTab("Result");
      
      toast.success("Submission received!");

    } catch (error) {
      console.error("Submission failed:", error);
      setSubmitResult({
        status: "error",
        errorMessage: error.response?.data?.message || "Submission failed",
      });
      setBottomTab("Result");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  if (loading)
    return (
      <div className="h-screen bg-[#0a0a0a] text-white flex items-center justify-center animate-fade-in">
        <Loader2 className="animate-spin text-[#4ADE80]" />
      </div>
    );
  if (!problem)
    return (
      <div className="h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        Problem not found
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-gray-300 font-sans animate-fade-in overflow-hidden">

      {/* Header and Layout */}
      <header className="h-[60px] bg-[#161616] border-b border-white/5 flex items-center justify-between px-6 z-20 shrink-0">
         {/* Left Side */}
         <div className="flex items-center gap-5">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 text-gray-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="text-[#4ADE80] transition-transform duration-300 group-hover:scale-110">
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
              <span onClick={() => navigate('/')} className="font-bold text-xl text-white tracking-tight group-hover:text-[#4ADE80] transition-colors duration-300">
                codeup
              </span>
            </div>
            <span className="text-gray-500 text-lg mx-1">/</span>
            <span className="text-base font-semibold text-white truncate max-w-[300px]">
              {problem.title}
            </span>
          </div>
        </div>
        
        {/* Right Side Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#333] px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/10 cursor-pointer"
          >
            {isRunning ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Play size={16} className="text-gray-400 fill-gray-400" />
            )}{" "}
            Run
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-[#4ADE80] hover:bg-[#3ec46d] text-black px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 shadow-[0_0_15px_rgba(74,222,128,0.25)] hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Cloud size={16} />
            )}{" "}
            Submit
          </button>

          {isAuthenticated ? (
            <div
              className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-[#4ADE80] hover:border-[#4ADE80] hover:shadow-[0_0_10px_rgba(74,222,128,0.2)] transition-all duration-300 cursor-pointer ml-4"
              onClick={() => navigate("/profile")}
            >
              <User size={20} />
            </div>
          ) : (
            <button
              onClick={() => navigate("/login", {state: {from: location.pathname}})}
              className="text-white font-semibold hover:text-gray-300 text-[16px] cursor-pointer ml-4"
            >
              Log In
            </button>
          )}
        </div>
      </header>

      {/* Main Content Layout (Left & Right Panes) */}
      <div className="flex-1 flex overflow-hidden relative">
        <div
          style={{ width: `${leftWidth}%` }}
          className="flex flex-col border-r border-white/5 bg-[#0a0a0a] min-w-[300px] transition-[width] duration-75 ease-linear h-full"
        >
          {/* Tabs */}
          <div className="flex items-center gap-6 px-6 pt-2 bg-[#121212] border-b border-white/5 overflow-x-auto h-[50px] shrink-0 scrollbar-hide">
            {["Description", "Editorial", "Submissions", "ChatAI"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`h-full flex items-center gap-2 text-sm font-medium border-b-2 transition-all duration-200 px-1 cursor-pointer whitespace-nowrap ${
                    activeTab === tab
                      ? "text-white border-[#4ADE80]"
                      : "text-gray-500 border-transparent hover:text-gray-300"
                  }`}
                >
                  {tab === "Description" && <FileText size={16} />} {tab}
                </button>
              )
            )}
          </div>

          {/* Left Pane Content Area - FIXED */}
          <div className={`flex-1 ${activeTab === "ChatAI" ? "overflow-hidden flex flex-col" : "overflow-y-auto p-8"} scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent`}>
            <div key={activeTab} className={`animate-slide-right ${activeTab === "ChatAI" ? "h-full" : ""}`}>
              {activeTab === "Description" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white">
                      {problem.title}
                    </h1>
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-medium border ${
                        problem.difficulty === "Easy"
                          ? "text-[#00B8A3] bg-[#00B8A3]/10 border-[#00B8A3]/20"
                          : problem.difficulty === "Medium"
                          ? "text-[#FFC01E] bg-[#FFC01E]/10 border-[#FFC01E]/20"
                          : "text-[#FF375F] bg-[#FF375F]/10 border-[#FF375F]/20"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                  <div className="prose prose-invert prose-base max-w-none text-gray-300">
                    <p className="leading-7 mb-8 whitespace-pre-line text-[15px]">
                      {problem.description}
                    </p>
                    {problem.visibleTestCases?.map((ex, i) => (
                      <div key={i} className="mb-6">
                        <h3 className="text-sm font-bold text-white mb-3">
                          Example {i + 1}:
                        </h3>
                        <div className="bg-[#161616] border-l-[3px] border-[#4ADE80] p-4 rounded-r text-[14px] font-mono text-gray-300 shadow-sm transition-colors hover:bg-[#1a1a1a]">
                          <div className="mb-2">
                            <span className="text-gray-500 select-none font-sans font-medium mr-2">
                              Input:
                            </span>{" "}
                            {ex.input}
                          </div>
                          <div className="mb-2">
                            <span className="text-gray-500 select-none font-sans font-medium mr-2">
                              Output:
                            </span>{" "}
                            {ex.output}
                          </div>
                          {ex.explanation && (
                            <div>
                              <span className="text-gray-500 select-none font-sans font-medium mr-2">
                                Explanation:
                              </span>{" "}
                              {ex.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "Submissions" && (
                <div className="space-y-1">
                  {!isAuthenticated ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                      <User size={48} className="mb-4 opacity-20" />
                      <p>Please login to view submissions</p>
                    </div>
                  ) : submissionsLoading ? (
                    <div className="text-center py-10">
                      <Loader2 className="animate-spin mx-auto text-[#4ADE80]" />
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      <History className="mx-auto mb-2 opacity-50" />
                      No submissions yet
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-white/10 animate-fade-in">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white/5 text-gray-400 font-medium">
                          <tr>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Lang</th>
                            <th className="px-4 py-3">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {submissions.map((sub) => (
                            <tr
                              key={sub._id}
                              onClick={() => setSelectedSubmission(sub)}
                              className="hover:bg-white/5 cursor-pointer transition-colors duration-150"
                            >
                              <td
                                className={`px-4 py-3 font-semibold ${
                                  sub.status === "accepted"
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {sub.status === "accepted" ? "Accepted" : "WA"}
                              </td>
                              <td className="px-4 py-3 text-gray-400 capitalize">
                                {sub.language}
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {formatDate(sub.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "ChatAI" && <ChatAI problem={problem} />}
              {activeTab === "Editorial" && <Editorial problemId={problem._id} />}
            </div>
          </div>
        </div>

        {/* Dragger */}
        <div
          className="w-1 hover:w-1.5 bg-[#1a1a1a] hover:bg-[#4ADE80] cursor-col-resize transition-all duration-200 z-50 flex items-center justify-center group absolute h-full"
          style={{ left: `${leftWidth}%` }}
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="h-8 w-1 bg-gray-600 rounded-full group-hover:bg-white transition-colors duration-200"></div>
        </div>

        {/* Right Pane */}
        <div
          style={{ width: `${100 - leftWidth}%`, marginLeft: "auto" }}
          className="flex flex-col bg-[#0e0e0e] min-w-[300px] h-full"
        >
          <div className="h-[50px] flex items-center justify-between px-4 border-b border-white/5 bg-[#121212] shrink-0">
            <div className="flex items-center gap-4">
              <LanguageSelector
                selected={selectedLanguage}
                onChange={handleLanguageChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetCode}
                className="p-2 hover:bg-[#262626] rounded-lg text-gray-500 hover:text-white transition-colors duration-200"
                title="Reset Code"
              >
                <RotateCcw size={16} />
              </button>
              <button
                className="p-2 hover:bg-[#262626] rounded-lg text-gray-500 hover:text-white transition-colors duration-200"
                title="Maximize"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden bg-[#0e0e0e]">
            <Editor
              height="100%"
              language={selectedLanguage}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val)}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20, bottom: 20 },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                background: "#0e0e0e",
              }}
            />
          </div>

          <div className="h-[300px] bg-[#121212] border-t border-white/5 flex flex-col shrink-0">
            <div className="flex items-center gap-6 px-6 border-b border-white/5 h-12">
              <button
                onClick={() => setBottomTab("Testcase")}
                className={`h-full flex items-center gap-2 text-sm font-bold border-b-2 transition-colors duration-200 ${
                  bottomTab === "Testcase"
                    ? "text-white border-[#4ADE80]"
                    : "text-gray-500 border-transparent hover:text-gray-300"
                }`}
              >
                <CheckCircle2
                  size={16}
                  className={`transition-colors duration-200 ${
                    bottomTab === "Testcase"
                      ? "text-[#4ADE80]"
                      : "text-gray-500"
                  }`}
                />{" "}
                Testcase
              </button>
              <button
                onClick={() => setBottomTab("Result")}
                className={`h-full flex items-center gap-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  bottomTab === "Result"
                    ? "text-white border-[#4ADE80]"
                    : "text-gray-500 border-transparent hover:text-gray-300"
                }`}
              >
                <Terminal
                  size={16}
                  className={`transition-colors duration-200 ${
                    bottomTab === "Result" ? "text-[#4ADE80]" : "text-gray-500"
                  }`}
                />{" "}
                Result
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-800">
              <div key={bottomTab} className="animate-slide-up h-full">
                {bottomTab === "Testcase" && (
                  <>
                    <div className="flex gap-4 mb-6">
                      {problem.visibleTestCases?.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveTestCaseId(idx)}
                          className={`px-5 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                            activeTestCaseId === idx
                              ? "bg-[#262626] text-white border-white/10"
                              : "text-gray-500 border-transparent hover:bg-[#1a1a1a]"
                          }`}
                        >
                          Case {idx + 1}
                        </button>
                      ))}
                    </div>
                    {problem.visibleTestCases?.[activeTestCaseId] && (
                      <div className="space-y-4 font-mono text-sm animate-fade-in">
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-2 font-sans">
                            Input:
                          </div>
                          <div className="bg-[#1a1a1a] px-4 py-3 rounded-lg text-gray-200 border border-white/5">
                            {problem.visibleTestCases[activeTestCaseId].input}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {bottomTab === "Result" && (
                  <div className="h-full">
                    {!runResults && !submitResult && !runError ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 animate-fade-in">
                        <Play size={32} className="mb-2 opacity-20" />
                        <p className="text-sm">Run code to see results</p>
                      </div>
                    ) : runError ? (
                      <div className="space-y-3 animate-slide-up">
                        <div className="text-red-400 font-bold flex items-center gap-2">
                          <AlertTriangle size={18} /> Error
                        </div>
                        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg font-mono text-sm border border-red-500/20 whitespace-pre-wrap">
                          {runError}
                        </div>
                      </div>
                    ) : submitResult ? (
                      <div className="space-y-6 animate-slide-up">
                        <div
                          className={`text-2xl font-bold flex items-center gap-3 ${
                            submitResult.status === "accepted"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {submitResult.status === "accepted" ? (
                            <CheckCircle2 size={28} />
                          ) : (
                            <XCircle size={28} />
                          )}
                          {submitResult.status === "accepted"
                            ? "Accepted"
                            : "Wrong Answer"}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5 transition-transform hover:scale-[1.02] duration-200">
                            <div className="text-gray-500 text-xs uppercase font-bold mb-1">
                              Runtime
                            </div>
                            <div className="text-xl text-white font-mono flex items-center gap-2">
                              <Clock size={16} className="text-gray-400" />{" "}
                              {submitResult.runtime || "N/A"} ms
                            </div>
                          </div>
                          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5 transition-transform hover:scale-[1.02] duration-200">
                            <div className="text-gray-500 text-xs uppercase font-bold mb-1">
                              Memory
                            </div>
                            <div className="text-xl text-white font-mono flex items-center gap-2">
                              <Database size={16} className="text-gray-400" />{" "}
                              {submitResult.memory || "N/A"} KB
                            </div>
                          </div>
                        </div>
                        {submitResult.testCasesPassed && (
                          <div className="bg-[#1a1a1a] px-4 py-3 rounded-lg text-sm text-gray-300 border border-white/5">
                            Test cases passed:{" "}
                            <span className="text-white font-bold">
                              {submitResult.testCasesPassed}
                            </span>
                          </div>
                        )}
                        {submitResult.errorMessage && (
                          <div className="bg-red-500/10 text-red-400 p-4 rounded-lg font-mono text-xs border border-red-500/20 whitespace-pre-wrap">
                            {submitResult.errorMessage}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-5 animate-slide-up">
                        <div className="flex gap-3">
                          {runResults.map((res, idx) => {
                            const expected =
                              problem.visibleTestCases[idx]?.output.trim();
                            const actual = res.stdout?.trim();
                            const passed = expected === actual;
                            return (
                              <button
                                key={idx}
                                onClick={() => setActiveTestCaseId(idx)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all duration-200 ${
                                  activeTestCaseId === idx
                                    ? "bg-[#262626] text-white border-white/20"
                                    : "text-gray-500 border-transparent hover:bg-[#1a1a1a]"
                                }`}
                              >
                                <div
                                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                                    passed ? "bg-green-500" : "bg-red-500"
                                  }`}
                                ></div>{" "}
                                Case {idx + 1}
                              </button>
                            );
                          })}
                        </div>
                        {runResults[activeTestCaseId] && (
                          <div className="space-y-4 font-mono text-sm animate-fade-in">
                            <div>
                              <div className="text-xs font-medium text-gray-500 mb-1.5 font-sans">
                                Input
                              </div>
                              <div className="bg-[#1a1a1a] px-4 py-3 rounded-lg text-gray-300 border border-white/5">
                                {
                                  problem.visibleTestCases[activeTestCaseId]
                                    .input
                                }
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-500 mb-1.5 font-sans">
                                Output
                              </div>
                              <div
                                className={`px-4 py-3 rounded-lg border transition-colors duration-300 ${
                                  runResults[
                                    activeTestCaseId
                                  ].stdout?.trim() ===
                                  problem.visibleTestCases[
                                    activeTestCaseId
                                  ].output.trim()
                                    ? "bg-green-500/5 text-green-400 border-green-500/20"
                                    : "bg-red-500/5 text-red-400 border-red-500/20"
                                }`}
                              >
                                {runResults[activeTestCaseId].stdout ||
                                  "No output"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-500 mb-1.5 font-sans">
                                Expected
                              </div>
                              <div className="bg-[#1a1a1a] px-4 py-3 rounded-lg text-gray-300 border border-white/5">
                                {
                                  problem.visibleTestCases[activeTestCaseId]
                                    .output
                                }
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SubmissionModal
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        submission={selectedSubmission}
      />
    </div>
  );
};

export default ProblemPage;