import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate, useSearchParams } from '@remix-run/react';
import { createSupabaseServerClient } from '~/utils/supabase.server';
import { motion } from 'framer-motion';
import {
  History,
  ArrowLeft,
  Filter,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { isOrganiser } from '~/utils/currentUser';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // Check if user is organiser
  const { isOrganiser: isUserOrganiser } = await isOrganiser(request);

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const itemsPerPage = parseInt(url.searchParams.get('itemsPerPage') || '10');
  const sortField = url.searchParams.get('sortField') || 'updated_at';
  const sortDirection = url.searchParams.get('sortDirection') || 'desc';
  const selectedMemberId = url.searchParams.get('memberId');
  const searchQuery = url.searchParams.get('search') || '';
  // Disable show all functionality for everyone
  const showAllHistory = false;

  const response = new Response();
  const supabase = createSupabaseServerClient(request);

  // Get current user information
  const {
    data: { user },
  } = await supabase.client.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Get member information for the current user
  const { data: currentMember, error: memberError } = await supabase.client
    .from('members')
    .select('id,bash_points,name')
    .eq(
      'github_username',
      params.github_username || user.user_metadata.user_name
    )
    .single();

  if (memberError || !currentMember) {
    console.error('Error fetching current member:', memberError);
    return redirect('/login');
  }

  // Get points history for current user
  const { data: userPointsHistory } = await supabase.client
    .from('points')
    .select('*')
    .eq('member_id', currentMember?.id)
    .order('updated_at', { ascending: false });

  let paginatedPointsHistory = null;
  let totalCount = 0;

  // Always fetch user's own points history with pagination (show all functionality disabled)
  const offset = (page - 1) * itemsPerPage;

  let userQuery = supabase.client
    .from('points')
    .select('*', { count: 'exact' })
    .eq('member_id', currentMember?.id);

  // Add search filter if specified
  if (searchQuery.trim()) {
    userQuery = userQuery.ilike('description', `%${searchQuery}%`);
  }

  // Add sorting
  const ascending = sortDirection === 'asc';
  if (sortField === 'points') {
    userQuery = userQuery.order('points', { ascending });
  } else {
    userQuery = userQuery.order('updated_at', { ascending });
  }

  // Add pagination
  userQuery = userQuery.range(offset, offset + itemsPerPage - 1);

  const { data: userHistory, error, count } = await userQuery;

  if (error) {
    console.error('Error fetching user points history:', error);
    return json({ error: 'Failed to fetch user points history' });
  }

  paginatedPointsHistory = userHistory;
  totalCount = count || 0;

  return json({
    isOrganiser: isUserOrganiser,
    currentMember,
    userPointsHistory: paginatedPointsHistory,
    totalCount,
    currentPage: page,
    itemsPerPage,
    sortField,
    sortDirection,
    searchQuery,
    showAllHistory: false, // Always disabled
  });
};

export default function PointsHistory() {
  const loaderData = useLoaderData<typeof loader>();

  if ('error' in loaderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-400">{loaderData.error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const {
    isOrganiser,
    currentMember,
    userPointsHistory,
    totalCount,
    currentPage,
    itemsPerPage,
    sortField,
    sortDirection,
    searchQuery,
    showAllHistory,
  } = loaderData;

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Function to update URL parameters
  const updateUrlParams = (updates: Record<string, string | number | boolean | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });

    navigate(`?${newParams.toString()}`, { replace: true });
  };

  // Function to handle sorting
  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    updateUrlParams({
      sortField: field,
      sortDirection: newDirection,
      page: 1, // Reset to first page when sorting changes
    });
  };

  // Get the current points data (already paginated from server)
  const pointsToDisplay = userPointsHistory;

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Clear all filters (only search now)
  const clearFilters = () => {
    updateUrlParams({
      search: null,
      page: 1,
    });
  };

  // Handle search input with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateUrlParams({
      search: value || null,
      page: 1, // Reset to first page when search changes
    });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(event.target.value, 10);
    updateUrlParams({
      itemsPerPage: newItemsPerPage,
      page: 1, // Reset to first page when items per page changes
    });
  };

  // Handle pagination
  const prevPage = () => {
    if (currentPage > 1) {
      updateUrlParams({ page: currentPage - 1 });
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      updateUrlParams({ page: pageNumber });
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      updateUrlParams({ page: currentPage + 1 });
    }
  };


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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
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
            View your complete points transaction history
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
              <h2 className="text-xl font-medium text-white">
                {currentMember?.name?.split(' ')[0]}'s Points
              </h2>
              <p className="text-gray-400">Current balance and history</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">
                {currentMember?.bash_points || 0}
              </div>
              <p className="text-gray-400">Total Points</p>
            </div>
          </div>
        </motion.div>

        {/* Search Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center mb-3">
            <Filter className="w-5 h-5 mr-2 text-blue-400" />
            <h3 className="text-lg font-medium">Search Your History</h3>

            {searchQuery && (
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-gray-400 hover:text-white flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Clear search
              </button>
            )}
          </div>

          <div className="relative">
            <input
              id="search-filter"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by description"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </motion.div>

        {/* Sort Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <h2 className="text-xl font-medium text-white">
            Points Transactions
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSort('updated_at')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                sortField === 'updated_at'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400'
              }`}
            >
              <span>Date</span>
              {sortField === 'updated_at' && (
                <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
            <button
              onClick={() => handleSort('points')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                sortField === 'points'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400'
              }`}
            >
              <span>Points</span>
              {sortField === 'points' && (
                <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
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
                      <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">
                        Points
                      </th>
                      <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase">
                        Description
                      </th>
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
                          {format(parseISO(entry.updated_at), 'MMM dd, yyyy')}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap font-medium ${
                            entry.points > 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {entry.points > 0 ? '+' : ''}
                          {entry.points}
                        </td>
                        <td className="px-6 py-4">
                          {entry.description || 'No description'}
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
                    {Math.min(currentPage * itemsPerPage, totalCount)}{' '}
                    of {totalCount}
                  </span>

                  <div className="flex gap-1">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`p-1 rounded hover:bg-white/10 ${
                        currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
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
                            currentPage === 1
                              ? 'bg-blue-500/30 text-blue-400'
                              : 'hover:bg-white/10'
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

                        {currentPage < totalPages - 2 && (
                          <span className="px-1">...</span>
                        )}

                        <button
                          onClick={() => goToPage(totalPages)}
                          className={`w-8 h-8 rounded-full ${
                            currentPage === totalPages
                              ? 'bg-blue-500/30 text-blue-400'
                              : 'hover:bg-white/10'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`p-1 rounded hover:bg-white/10 ${
                        currentPage === totalPages
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
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
