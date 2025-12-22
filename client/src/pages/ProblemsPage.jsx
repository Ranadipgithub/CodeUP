import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosClient from "@/utils/axiosClient";
import { 
  Search, 
  X, 
  Filter, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  MoreHorizontal,
  ChevronDown,
  RotateCcw
} from "lucide-react";

// --- SHADCN IMPORTS ---
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Mock Data for Sidebar
const COMPANIES = ["Google", "Amazon", "Meta", "Netflix", "Microsoft", "Uber", "Apple"];

const ProblemsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // --- DATA STATES ---
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  
  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // --- FILTER STATES ---
  const [filters, setFilters] = useState({
    search: "",
    difficulty: "All",
    status: "All",
    topic: "All"
  });

  const [activeDropdown, setActiveDropdown] = useState(null);

  // --- API FETCHING ---
  const fetchProblems = async (page) => {
    setIsLoading(true);
    try {
      // Backend integration
      const response = await axiosClient.get(`/problem/getProblemsByPage?page=${page}&limit=20`);
      const data = response.data;
      
      const problemsArray = Array.isArray(data.problems) ? data.problems : [];
      setProblems(problemsArray);
      
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || page);
      
    } catch (error) {
      console.error("fetchProblems:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSolvedProblems = async () => {
    try {
      const { data } = await axiosClient.get("/problem/problemSolvedByUser");
      setSolvedProblems(Array.isArray(data) ? data : (data.solvedProblems || []));
    } catch (error) {
      console.error("fetchSolvedProblems:", error);
    }
  };

  useEffect(() => {
    fetchProblems(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (user) fetchSolvedProblems();
  }, [user]);


  // --- HELPERS ---
  const solvedIds = useMemo(() => {
    const set = new Set();
    for (const item of solvedProblems) {
      if (typeof item === "string" || typeof item === "number") {
        set.add(String(item));
      } else if (item?._id || item?.id) {
        set.add(String(item._id ?? item.id));
      }
    }
    return set;
  }, [solvedProblems]);

  const isSolved = (problem) => {
    const id = String(problem._id ?? problem.id ?? "");
    return solvedIds.has(id);
  };

  const uniqueTags = useMemo(() => {
    const tags = new Set();
    problems.forEach(p => {
      if (p.tags && typeof p.tags === 'string') tags.add(p.tags);
    });
    return Array.from(tags).sort();
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      const matchesSearch = problem.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesDifficulty = filters.difficulty === "All" || problem.difficulty?.toLowerCase() === filters.difficulty.toLowerCase();
      const matchesTopic = filters.topic === "All" || problem.tags === filters.topic;
      
      let matchesStatus = true;
      if (filters.status === "Solved") matchesStatus = isSolved(problem);
      else if (filters.status === "Unsolved") matchesStatus = !isSolved(problem);

      return matchesSearch && matchesDifficulty && matchesTopic && matchesStatus;
    });
  }, [problems, filters, solvedIds]);

  const resetFilters = () => {
    setFilters({ search: "", difficulty: "All", topic: "All", status: "All" });
    setActiveDropdown(null);
  };

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const getAcceptance = () => Math.floor(Math.random() * 50 + 30) + "%";

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- PAGINATION LOGIC (Generates page numbers) ---
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (currentPage <= 3) {
        items.push(1, 2, 3, "ellipsis", totalPages);
      } else if (currentPage >= totalPages - 2) {
        items.push(1, "ellipsis", totalPages - 2, totalPages - 1, totalPages);
      } else {
        items.push(1, "ellipsis", currentPage, "ellipsis", totalPages);
      }
    }

    return items.map((item, index) => {
      if (item === "ellipsis") {
        return (
          <PaginationItem key={`ellipsis-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      return (
        <PaginationItem key={item}>
          <PaginationLink
            href="#"
            isActive={currentPage === item}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(item);
            }}
          >
            {item}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#4ADE80] selection:text-black pb-20">
      
      {/* MAIN WRAPPER */}
      <main className="max-w-[1300px] w-full mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8 animate-fade-in">
        
        {/* LEFT COLUMN */}
        <div className="flex-1 w-full min-w-0">
          
          {/* 1. TAGS SCROLLER */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
             <button 
                onClick={() => setFilters(prev => ({...prev, topic: "All"}))} 
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors border ${filters.topic === 'All' ? 'bg-white text-black border-white' : 'bg-[#2A2A2A] text-gray-300 border-white/5 hover:bg-[#3A3A3A]'}`}
              >
                All Topics
              </button>
            {uniqueTags.map(tag => (
              <button 
                key={tag} 
                onClick={() => setFilters(prev => ({...prev, topic: tag}))}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors border ${filters.topic === tag ? 'bg-[#4ADE80] text-black border-[#4ADE80]' : 'bg-[#2A2A2A] text-gray-300 border-white/5 hover:bg-[#3A3A3A]'}`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 2. FILTER BAR */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                value={filters.search} 
                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))} 
                placeholder="Search questions (current page)" 
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-base text-gray-200 focus:outline-none focus:border-[#4ADE80] transition-colors placeholder:text-gray-600" 
              />
              {filters.search && (
                <button onClick={() => setFilters(prev => ({...prev, search: ""}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>
             
            {/* Custom Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              <FilterDropdown 
                label="Difficulty" 
                value={filters.difficulty} 
                options={['All', 'Easy', 'Medium', 'Hard']} 
                onChange={(val) => setFilters(prev => ({...prev, difficulty: val}))} 
                active={activeDropdown === 'difficulty'} 
                onToggle={() => toggleDropdown('difficulty')} 
                onClose={() => setActiveDropdown(null)} 
              />

              <FilterDropdown 
                label="Status" 
                value={filters.status} 
                options={['All', 'Solved', 'Unsolved']} 
                onChange={(val) => setFilters(prev => ({...prev, status: val}))} 
                active={activeDropdown === 'status'} 
                onToggle={() => toggleDropdown('status')} 
                onClose={() => setActiveDropdown(null)} 
              />

              <FilterDropdown 
                label="Tags" 
                value={filters.topic} 
                options={['All', ...uniqueTags]} 
                onChange={(val) => setFilters(prev => ({...prev, topic: val}))} 
                active={activeDropdown === 'tags'} 
                onToggle={() => toggleDropdown('tags')} 
                onClose={() => setActiveDropdown(null)} 
              />

              {(filters.difficulty !== 'All' || filters.status !== 'All' || filters.topic !== 'All' || filters.search) && (
                <button onClick={resetFilters} className="flex items-center gap-1 text-[#FF375F] text-sm font-medium hover:bg-[#FF375F]/10 px-3 py-2 rounded-lg transition-colors">
                  <RotateCcw size={14} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* 3. PROBLEMS TABLE */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden min-h-[400px] flex flex-col shadow-xl shadow-black/20">
              <div className="overflow-x-auto w-full">
                <div className="min-w-[800px]">
                   <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-sm text-gray-400 font-semibold uppercase tracking-wider">
                     <div className="col-span-1">Status</div>
                     <div className="col-span-5">Title</div>
                     <div className="col-span-2">Tags</div>
                     <div className="col-span-2">Acceptance</div>
                     <div className="col-span-2">Difficulty</div>
                   </div>
                   
                   {isLoading ? (
                     <div className="h-64 flex items-center justify-center text-gray-500">Loading problems...</div>
                   ) : filteredProblems.length > 0 ? (
                     filteredProblems.map((problem, idx) => {
                       const solved = isSolved(problem);
                       return (
                        <div 
                          key={problem._id || idx} 
                          onClick={() => navigate(`/problem/${problem._id}`)} 
                          className={`grid grid-cols-12 gap-4 px-6 py-5 border-b border-white/5 items-center hover:bg-[#252525] transition-colors group cursor-pointer ${idx % 2 === 0 ? 'bg-[#1A1A1A]' : 'bg-[#161616]'}`}
                        >
                           <div className="col-span-1">
                              {solved ? (
                                <CheckCircle2 size={20} className="text-[#4ADE80]" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-gray-600 group-hover:border-gray-400"></div>
                              )}
                           </div>
                           
                           <div className="col-span-5 text-lg font-medium text-gray-200 group-hover:text-[#4ADE80] truncate pr-4 transition-colors">
                              {(currentPage - 1) * 20 + idx + 1}. {problem.title}
                           </div>
                           
                           <div className="col-span-2">
                              {problem.tags ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#2A2A2A] text-gray-300 border border-white/5 group-hover:border-white/20 transition-colors">
                                  {problem.tags}
                                </span>
                              ) : <span className="text-gray-600">-</span>}
                           </div>
                           
                           <div className="col-span-2 text-gray-400 text-base font-mono">
                             {getAcceptance()}
                           </div>
                           
                           <div className="col-span-2 text-base font-medium">
                              <span className={`
                                ${problem.difficulty?.toLowerCase() === 'easy' ? 'text-[#00B8A3]' : 
                                  problem.difficulty?.toLowerCase() === 'medium' ? 'text-[#FFC01E]' : 
                                  'text-[#FF375F]'}
                              `}>
                                {problem.difficulty}
                              </span>
                           </div>
                        </div>
                       );
                     })
                   ) : (
                     <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <Filter size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">No problems found</p>
                     </div>
                   )}
                </div>
              </div>
          </div>

          {/* 4. PAGINATION (SHADCN IMPLEMENTATION) */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {renderPaginationItems()}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full lg:w-[360px] flex flex-col gap-6">
           {/* Sidebar content stays the same */}
           <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-5">
                 <div className="font-bold text-gray-200 flex items-center gap-2 text-base">
                   <Calendar size={20} className="text-[#4ADE80]" /> Day {new Date().getDate()}
                 </div>
                 <span className="text-sm text-orange-400 font-mono">0 Day Streak</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                 {Array.from({length: 35}).map((_, i) => (
                    <div key={i} className={`h-9 rounded-md flex items-center justify-center text-sm ${i === new Date().getDate() ? 'bg-[#4ADE80] text-black font-bold' : 'text-gray-500 hover:bg-white/5'}`}>
                      {i + 1 <= 30 ? i + 1 : ''}
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-200 text-base flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-400" /> Trending Companies
                  </h3>
                  <MoreHorizontal size={20} className="text-gray-500 cursor-pointer hover:text-white transition-colors" />
              </div>
              <div className="flex flex-wrap gap-2.5">
                  {COMPANIES.map(company => (
                     <span key={company} className="bg-[#2A2A2A] text-gray-300 px-3.5 py-1.5 rounded-full text-sm hover:bg-[#333] cursor-pointer border border-white/5 transition-colors">
                       {company}
                     </span>
                  ))}
              </div>
           </div>
        </div>

      </main>
    </div>
  );
};

// --- HELPER COMPONENT ---
const FilterDropdown = ({ label, value, options, onChange, active, onToggle, onClose }) => {
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (active) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [active, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
          active || (value !== 'All')
            ? "bg-[#2A2A2A] text-white border-white/20"
            : "bg-[#1A1A1A] text-gray-300 border-white/10 hover:bg-[#252525]"
        }`}
      >
        <span>{value === 'All' ? label : value}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${active ? 'rotate-180' : ''}`} />
      </button>
      {active && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option) => (
              <div
                key={option}
                onClick={() => { onChange(option); onClose(); }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                  value === option
                    ? "bg-[#4ADE80]/10 text-[#4ADE80] font-medium"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {option === 'All' ? `All ${label}` : option}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemsPage;