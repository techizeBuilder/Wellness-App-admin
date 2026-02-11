import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../utils/api';
import config from '../utils/config';

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState([
    { id: 1, message: 'New user registration', time: '2 min ago', unread: true },
    { id: 2, message: 'Payment received', time: '5 min ago', unread: true },
    { id: 3, message: 'Booking cancelled', time: '10 min ago', unread: false },
  ]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState({
    name: 'Admin User',
    email: 'admin@zenovia.com',
    profileImage: null
  });
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Fetch admin profile
  const fetchAdminProfile = async () => {
    try {
      const response = await apiGet('/api/admin/profile');
      if (response.success && response.data?.admin) {
        const admin = response.data.admin;
        setAdminProfile({
          name: admin.name || 'Admin User',
          email: admin.email || 'admin@zenovia.com',
          profileImage: admin.profileImage || null
        });
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
    }
  };

  useEffect(() => {
    fetchAdminProfile();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchAdminProfile();
    };

    window.addEventListener('adminProfileUpdated', handleProfileUpdate);

    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('adminProfileUpdated', handleProfileUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    localStorage.removeItem('adminAuth');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality here
      console.log('Searching for:', searchQuery);
      // You can navigate to a search results page or filter current data
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchRef.current?.focus();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button - Only visible on mobile */}
        <div className="lg:hidden">
          <button
            className="p-2 text-gray-600 hover:text-primary-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-4 lg:mx-0">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, experts, bookings..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              aria-label="Search"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-gray-600 hover:text-primary-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-coral-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden="true" />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-sm text-coral-400 font-medium">{unreadCount} new</span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${notification.unread ? 'bg-blue-50 border-l-4 border-l-coral-400' : ''
                            }`}
                        >
                          <p className="text-sm text-gray-900 font-medium">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <button className="text-primary-900 text-sm font-medium hover:text-primary-700 transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 lg:space-x-3 p-2 text-gray-700 hover:text-primary-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="User menu"
              aria-expanded={isProfileOpen}
            >
              {adminProfile.profileImage ? (
                <img
                  src={`${config.getApiUrl()}/uploads/profiles/${adminProfile.profileImage}`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {adminProfile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium">{adminProfile.name}</div>
                <div className="text-xs text-gray-500">{adminProfile.email}</div>
              </div>
              <ChevronDown
                size={16}
                className={`transform transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''} hidden sm:block`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden="true" />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-900">{adminProfile.name}</div>
                    <div className="text-xs text-gray-500">{adminProfile.email}</div>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings size={16} className="mr-2" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;