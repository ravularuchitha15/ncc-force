import { Bell, Search, ChevronDown, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notifications } from '../../data/mockData';
import toast from 'react-hot-toast';

export default function TopBar({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);

  const unreadCount = notifications.filter(n => n.userId === user?.id && !n.read).length;

  const notifPath = role === 'officer' ? '/officer/notifications' : '/cadet/notifications';
  const profilePath = role === 'officer' ? '/officer/profile' : '/cadet/profile';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between gap-4 shadow-sm sticky top-0 z-30">
      {/* Left — spacer for mobile menu button */}
      <div className="w-8 lg:hidden" />

      {/* Search */}
      <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-xs">
        <Search size={16} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm text-navy-500 placeholder-gray-400 outline-none w-full"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <Link
          to={notifPath}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} className="text-navy-400" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setDropOpen(!dropOpen)}
            aria-expanded={dropOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-navy-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user?.name?.charAt(0)}</span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-navy-500 max-w-28 truncate">{user?.name}</div>
              <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {dropOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 animate-fade-in">
                <Link
                  to={profilePath}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-navy-400 hover:bg-gray-50 hover:text-navy-600"
                  onClick={() => setDropOpen(false)}
                >
                  <UserCircle size={16} />
                  Profile
                </Link>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
