import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'operator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-blue-600">📦</span>
                <span className="ml-2 text-xl font-semibold text-gray-900">
                  Inventory System
                </span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/inventory"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Inventory
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Products
                </Link>
                <Link
                  to="/orders"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Orders
                </Link>
                <Link
                  to="/rd"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  R&D
                </Link>
                <Link
                  to="/maintenance"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Maintenance
                </Link>
                <Link
                  to="/sales"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Sales
                </Link>
                <Link
                  to="/shipping"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Shipping
                </Link>
                <Link
                  to="/history"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  History
                </Link>
                <Link
                  to="/financials"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Financials
                </Link>
              </div>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getRoleBadgeColor(user?.role || '')}`}>
                    {user?.role?.toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
