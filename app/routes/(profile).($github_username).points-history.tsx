import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { createServerSupabase } from "~/utils/supabase.server";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, Users, ArrowLeft, ChevronDown, ChevronUp, 
  Filter, ChevronRight, ChevronLeft, Search, X 
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { isOrganiser } from "~/utils/currentUser";

export const loader = async ({ request,params }: LoaderFunctionArgs) => {
    // Check if user is organiser
    const isUserOrganiser = await isOrganiser(request);
    
    const response = new Response();
    const supabase = createServerSupabase(request, response);
    
    // Get current user information
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return redirect("/login");
    }
    
    // Get member information for the current user
    const { data: currentMember, error: memberError } = await supabase
        .from("members")
        .select("id,bash_points,name")
        .eq("github_username",params.github_username || user.user_metadata.user_name)
        .single();
    
    if (memberError || !currentMember) {
        console.error("Error fetching current member:", memberError);
        return redirect("/login");
    }
   
    // Get points history for current user
    const { data: userPointsHistory } = await supabase
        .from("points")
        .select("*")
        .eq("member_id", currentMember?.id)
        .order("updated_at", { ascending: false });
    
    let allPointsHistory = null;
    let allMembers = null;
    
    // If user is organiser, fetch all points history and all members for filtering
    if (isUserOrganiser) {
        const { data: allHistory, error } = await supabase
            .from("points")
            .select("*, member:members!points_member_id_fkey(id,name)")
            .order("updated_at", { ascending: false });
        
        allPointsHistory = allHistory;
        
        if (error) {
            console.error("Error fetching all points history:", error);
            return json({ error: "Failed to fetch all points history" });
        }
        
        // Fetch all members for the filter dropdown
        const { data: members } = await supabase
            .from("members")
            .select("id,name")
            .order("name");
            
        allMembers = members;
    }
    
    return json({
        isOrganiser: isUserOrganiser,
        currentMember,
        userPointsHistory,
        allPointsHistory,
        allMembers
    });
};

export default function PointsHistory() {
    const { isOrganiser, currentMember, userPointsHistory, allPointsHistory, allMembers } = useLoaderData<typeof loader>();
    const [showAllHistory, setShowAllHistory] = useState(false);
    const [sortField, setSortField] = useState("updated_at");
    const [sortDirection, setSortDirection] = useState("desc");
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedMemberId, searchQuery, showAllHistory]);
    
    // Function to handle sorting
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
        // Reset to first page when sorting changes
        setCurrentPage(1);
    };
    
    // Function to sort and filter points history
    const processPointsHistory = (history: any[]) => {
        if (!history) return [];
        
        // First apply member filtering if a member is selected
        let filtered = history;
        
        if (isOrganiser && showAllHistory) {
            // Apply member filter if selected
            if (selectedMemberId) {
                filtered = filtered.filter(entry => entry.member_id === selectedMemberId);
            }
            
            // Apply search query if provided
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                filtered = filtered.filter(entry => 
                    (entry.description && entry.description.toLowerCase().includes(query)) ||
                    (entry.member?.name && entry.member.name.toLowerCase().includes(query))
                );
            }
        }
        
        // Then apply sorting
        return [...filtered].sort((a, b) => {
            if (sortField === "points") {
                return sortDirection === "asc" ? a.points - b.points : b.points - a.points;
            } else if (sortField === "updated_at") {
                return sortDirection === "asc" 
                    ? new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
                    : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            }
            return 0;
        });
    };
    
    // Get the appropriate points history based on user role and selection
    const sortedData = isOrganiser && showAllHistory 
        ? processPointsHistory(allPointsHistory)
        : processPointsHistory(userPointsHistory);
    
    // Calculate total pages
    const totalPages = Math.ceil((sortedData?.length || 0) / itemsPerPage);
    
    // Get current page data
    const pointsToDisplay = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedData?.slice(startIndex, endIndex) || [];
    }, [sortedData, currentPage, itemsPerPage]);
    
    // Handle member selection
    const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const memberId = e.target.value;
        setSelectedMemberId(memberId === "all" ? null : memberId);
    };
    
    // Clear all filters
    const clearFilters = () => {
        setSelectedMemberId(null);
        setSearchQuery("");
    };

    function handleItemsPerPageChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        const newItemsPerPage = parseInt(event.target.value, 10);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to the first page when items per page changes
    }
    function prevPage(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }
    function goToPage(pageNumber: number): void {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    }
    function nextPage(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-12 px-4">
            {/* Navigation */}
                    <div className="mb-8 flex justify-between items-center">
                    <button 
                        onClick={() => history.back()}
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Profile
                    </button>
                      
                    </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4"
                    >
                        <History className="w-8 h-8 text-blue-400" />
                    </motion.div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Points History
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {isOrganiser 
                            ? "View your points history or all members' points history" 
                            : "View your points history"}
                    </p>
                </motion.div>
                
                {/* User Points Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-medium text-white">Your Points</h2>
                            <p className="text-gray-400">Current balance and history</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-blue-400">{currentMember?.bash_points || 0}</div>
                            <p className="text-gray-400">Total Points</p>
                        </div>
                    </div>
                </motion.div>
                
                {/* Toggle for Organizers */}
                {isOrganiser && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <button
                            onClick={() => setShowAllHistory(!showAllHistory)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 
                                border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-400" />
                                <span>{showAllHistory ? "Viewing All Members' History" : "Viewing Your History"}</span>
                            </div>
                            <div>
                                {showAllHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                        </button>
                    </motion.div>
                )}
                
                {/* Filter Controls for Organizers */}
                {isOrganiser && showAllHistory && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 space-y-3"
                    >
                        <div className="flex items-center">
                            <Filter className="w-5 h-5 mr-2 text-blue-400" />
                            <h3 className="text-lg font-medium">Filters</h3>
                            
                            {(selectedMemberId || searchQuery) && (
                                <button 
                                    onClick={clearFilters}
                                    className="ml-auto text-sm text-gray-400 hover:text-white flex items-center"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Clear filters
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Member Filter */}
                            <div>
                                <label htmlFor="member-filter" className="block text-sm font-medium text-gray-400 mb-1">
                                    Filter by Member
                                </label>
                                <select
                                    id="member-filter"
                                    value={selectedMemberId || "all"}
                                    onChange={handleMemberSelect}
                                    className="w-full  border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Members</option>
                                    {allMembers && allMembers.map((member: any) => (
                                        <option key={member.id} value={member.name}>
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Search Filter */}
                            <div>
                                <label htmlFor="search-filter" className="block text-sm font-medium text-gray-400 mb-1">
                                    Search
                                </label>
                                <div className="relative">
                                    <input
                                        id="search-filter"
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by description or member name"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                
                {/* Sort Controls */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-4"
                >
                    <h2 className="text-xl font-medium text-white">Points Transactions</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSort("updated_at")}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                                sortField === "updated_at" ? "bg-blue-500/20 text-blue-400" : "text-gray-400"
                            }`}
                        >
                            <span>Date</span>
                            {sortField === "updated_at" && (
                                <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                            )}
                        </button>
                        <button
                            onClick={() => handleSort("points")}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                                sortField === "points" ? "bg-blue-500/20 text-blue-400" : "text-gray-400"
                            }`}
                        >
                            <span>Points</span>
                            {sortField === "points" && (
                                <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                            )}
                        </button>
                    </div>
                </motion.div>
                
                {/* Points History List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
                >
                    {pointsToDisplay && pointsToDisplay.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-black/20 text-left">
                                            <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Date</th>
                                            {isOrganiser && showAllHistory && (
                                                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Member</th>
                                            )}
                                            <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Points</th>
                                            <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {pointsToDisplay.map((entry: any) => (
                                            <motion.tr 
                                                key={entry.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="hover:bg-white/5"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {new Date(entry.updated_at).toLocaleDateString()}
                                                </td>
                                                {isOrganiser && showAllHistory && (
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {entry.member?.name || "Unknown"}
                                                    </td>
                                                )}
                                                <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                                                    entry.points > 0 ? "text-green-400" : "text-red-400"
                                                }`}>
                                                    {entry.points > 0 ? "+" : ""}{entry.points}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {entry.description || "No description"}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination Controls */}
                            <div className="p-4 bg-black/20 border-t border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">Rows per page:</span>
                                    <select 
                                        value={itemsPerPage} 
                                        onChange={handleItemsPerPageChange}
                                        className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                                
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-400 mr-4">
                                        {(currentPage - 1) * itemsPerPage + 1}-
                                        {Math.min(currentPage * itemsPerPage, sortedData?.length || 0)} of {sortedData?.length || 0}
                                    </span>
                                    
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={prevPage} 
                                            disabled={currentPage === 1}
                                            className={`p-1 rounded hover:bg-white/10 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        
                                        {totalPages <= 5 ? (
                                            // Show all page numbers if 5 or fewer
                                            [...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => goToPage(i + 1)}
                                                    className={`w-8 h-8 rounded-full ${
                                                        currentPage === i + 1 
                                                            ? 'bg-blue-500/30 text-blue-400' 
                                                            : 'hover:bg-white/10'
                                                    }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))
                                        ) : (
                                            // Show limited page numbers with ellipsis for many pages
                                            <>
                                                <button
                                                    onClick={() => goToPage(1)}
                                                    className={`w-8 h-8 rounded-full ${
                                                        currentPage === 1 ? 'bg-blue-500/30 text-blue-400' : 'hover:bg-white/10'
                                                    }`}
                                                >
                                                    1
                                                </button>
                                                
                                                {currentPage > 3 && <span className="px-1">...</span>}
                                                
                                                {currentPage > 2 && (
                                                    <button
                                                        onClick={() => goToPage(currentPage - 1)}
                                                        className="w-8 h-8 rounded-full hover:bg-white/10"
                                                    >
                                                        {currentPage - 1}
                                                    </button>
                                                )}
                                                
                                                {currentPage !== 1 && currentPage !== totalPages && (
                                                    <button
                                                        onClick={() => goToPage(currentPage)}
                                                        className="w-8 h-8 rounded-full bg-blue-500/30 text-blue-400"
                                                    >
                                                        {currentPage}
                                                    </button>
                                                )}
                                                
                                                {currentPage < totalPages - 1 && (
                                                    <button
                                                        onClick={() => goToPage(currentPage + 1)}
                                                        className="w-8 h-8 rounded-full hover:bg-white/10"
                                                    >
                                                        {currentPage + 1}
                                                    </button>
                                                )}
                                                
                                                {currentPage < totalPages - 2 && <span className="px-1">...</span>}
                                                
                                                <button
                                                    onClick={() => goToPage(totalPages)}
                                                    className={`w-8 h-8 rounded-full ${
                                                        currentPage === totalPages ? 'bg-blue-500/30 text-blue-400' : 'hover:bg-white/10'
                                                    }`}
                                                >
                                                    {totalPages}
                                                </button>
                                            </>
                                        )}
                                        
                                        <button 
                                            onClick={nextPage} 
                                            disabled={currentPage === totalPages}
                                            className={`p-1 rounded hover:bg-white/10 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-10 text-center text-gray-400">
                            No points transactions found
                        </div>
                    )}
                </motion.div>
                
                {/* Back Button */}
                <motion.div className="mt-6 text-center">
                    <button 
                        onClick={() => history.back()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 
                            border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}