import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ChevronDown, ChevronUp, ChevronRight, History } from 'lucide-react';
import { Link } from '@remix-run/react';

function PointsGraph({
  pointsHistory,
  isLegacyBasher = false,
}: {
  pointsHistory: any[];
  isLegacyBasher?: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);

  // Validate and filter the pointsHistory data
  const validPointsHistory = pointsHistory?.filter(entry => 
    entry && 
    typeof entry.points === 'number' && 
    entry.updated_at &&
    entry.description
  ) || [];

  // Calculate total points (sum of all point transactions)
  const totalPoints = validPointsHistory.reduce(
    (sum, entry) => sum + entry.points,
    0
  );

  // Process the data to create a cumulative points graph
  const processedData = validPointsHistory.reduce(
    (acc: any[], entry: any, index: number) => {
      try {
        const date = format(parseISO(entry.updated_at.split('T')[0]), 'MMM dd');
        const lastTotal = index > 0 ? acc[acc.length - 1].totalPoints : 0;
        const totalPoints = lastTotal + entry.points;

        acc.push({
          date,
          rawDate: entry.updated_at,
          points: entry.points,
          totalPoints,
          description: entry.description,
        });
      } catch (error) {
        console.warn('Error processing points history entry:', entry, error);
      }

      return acc;
    },
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        isLegacyBasher
          ? 'bg-yellow-500/10 backdrop-blur-lg border border-yellow-400/20'
          : 'bg-white/5 backdrop-blur-lg'
      } rounded-xl p-6 mt-8`}
    >
      {/* Points Summary - Always visible */}
      <div
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center justify-between cursor-pointer"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          Points History
        </h2>

        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-blue-400">
            {totalPoints}{' '}
            <span className="text-base font-normal text-gray-400">points</span>
          </div>

          <button
            className="rounded-full p-1 hover:bg-white/10 transition-colors"
            aria-label={showDetails ? 'Hide details' : 'Show details'}
          >
            {showDetails ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Details section - Only visible when toggled */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Points Graph */}
            <div className="h-64 sm:h-80 mt-6">
              {processedData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={processedData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorPoints"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={isLegacyBasher ? '#FFD700' : '#3b82f6'}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={isLegacyBasher ? '#FFD700' : '#3b82f6'}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white',
                      }}
                      labelFormatter={(value) => `Date: ${value}`}
                      formatter={(value, name, props) => {
                        if (name === 'Total Points') {
                          return [`${value} points`, name];
                        } else {
                          const point = props.payload;
                          const numValue = Number(value);
                          return [
                            `${numValue > 0 ? '+' + numValue : numValue} points (${
                              point.description
                            })`,
                            name,
                          ];
                        }
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalPoints"
                      name="Total Points"
                      stroke={isLegacyBasher ? '#FFD700' : '#3b82f6'}
                      fillOpacity={1}
                      fill="url(#colorPoints)"
                    />
                    <ReferenceLine
                      y={0}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth={1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No points history available.
                </div>
              )}
            </div>

            {/* Recent Points Transactions */}
            {validPointsHistory.length > 0 && (
              <div className="mt-6">
                {/* <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Transactions</h3>
                 <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {[...validPointsHistory]
                    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                    .slice(0, 5)
                    .map((entry) => (
                      <div 
                        key={entry.id}
                        className="bg-white/5 rounded-lg p-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-sm">{entry.description}</p>
                          <p className="text-xs text-gray-400">
                            {format(parseISO(entry.updated_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className={`text-lg font-semibold ${
                          entry.points > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {entry.points > 0 ? '+' : ''}{entry.points}
                        </div>
                      </div>
                    ))
                  }
                </div> */}

                {/* View All Link */}
                <div className="mt-4 text-center">
                  <Link
                    to="points-history"
                    className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1"
                  >
                    View all transactions
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default PointsGraph;
