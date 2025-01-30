import { Link } from "@remix-run/react"

export default function Nav() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">Leaderboard</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/leaderboard"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-indigo-600"
              >
                View Leaderboard
              </Link>
              <Link
                to="/manage-points"
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-indigo-600"
              >
                Manage Points
              </Link>
              <Link to="/add-member" className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-indigo-600">
                Add Member
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

