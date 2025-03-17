// interface League {
//   name: string
//   color: string
//   minPoints: number
//   icon: JSX.Element
//   background: string
//   textColor: string
// }

// const LEAGUES: Record<string, League> = {
//   bronze: {
//     name: "Bronze League",
//     color: "orange",
//     minPoints: 0,
//     icon: <Star className="w-6 h-6" />,
//     background: "bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500",
//     textColor: "text-orange-900",
//   },silver: {
//     name: "Silver League",
//     color: "gray",
//     minPoints: 100,
//     icon: <Award className="w-6 h-6" />,
//     background: "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500",
//     textColor: "text-gray-900",
//   },gold: {
//     name: "Gold League",
//     color: "amber",
//     minPoints: 200,
//     icon: <Trophy className="w-6 h-6" />,
//     background: "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600",
//     textColor: "text-amber-900",
//   },
  
//   platinum: {
//     name: "Platinum League",
//     color: "slate",
//     minPoints: 500,
//     icon: <Medal className="w-6 h-6" />,
//     background: "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500",
//     textColor: "text-slate-900",
//   },
//   diamond: {
//     name: "Diamond League",
//     color: "cyan",
//     minPoints: 1000,
//     icon: <Crown className="w-6 h-6" />,
//     background: "bg-gradient-to-br from-cyan-300 via-cyan-400 to-cyan-600",
//     textColor: "text-cyan-900",
//   },
  
  
// }

// function getLeague(points: number): string {
//   if (points >= LEAGUES.diamond.minPoints) return "diamond"
//   if (points >= LEAGUES.platinum.minPoints) return "platinum"
//   if (points >= LEAGUES.gold.minPoints) return "gold"
//   if (points >= LEAGUES.silver.minPoints) return "silver"
//   return "bronze"
// }



 {/* League Selection */}
          {/* <div className="mt-6">
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const leagueKeys = Object.keys(LEAGUES)
                  const currentIndex = leagueKeys.indexOf(currentLeague)
                  if (currentIndex > 0) {
                    setCurrentLeague(leagueKeys[currentIndex - 1])
                  }
                }}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                disabled={Object.keys(LEAGUES).indexOf(currentLeague) === 0}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>

              <div className={`text-center px-8 py-3 rounded-xl ${LEAGUES[currentLeague]?.background}`}>
                <div className="flex items-center justify-center gap-2">
                  {LEAGUES[currentLeague]?.icon}
                  <h2 className={`text-2xl font-bold ${LEAGUES[currentLeague]?.textColor}`}>
                    {LEAGUES[currentLeague]?.name}
                  </h2>
                </div>
                <p className={`text-sm ${LEAGUES[currentLeague]?.textColor}`}>{leagueMembers.length} members</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const leagueKeys = Object.keys(LEAGUES)
                  const currentIndex = leagueKeys.indexOf(currentLeague)
                  if (currentIndex < leagueKeys.length - 1) {
                    setCurrentLeague(leagueKeys[currentIndex + 1])
                  }
                }}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                disabled={Object.keys(LEAGUES).indexOf(currentLeague) === Object.keys(LEAGUES).length - 1}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div> */}
