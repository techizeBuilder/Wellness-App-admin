import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  CreditCard,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/users', name: 'Users', icon: Users },
    { path: '/experts', name: 'Experts', icon: UserCheck },
    { path: '/bookings', name: 'Bookings', icon: Calendar },
    { path: '/payments', name: 'Payments', icon: CreditCard },
    { path: '/subscriptions', name: 'Subscriptions', icon: Package },
    { path: '/reports', name: 'Reports', icon: BarChart3 },
    { path: '/settings', name: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary-900 text-white rounded-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          bg-primary-900 text-white transform transition-all duration-300 ease-in-out
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary-800">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
                <span className="text-primary-900 font-bold text-lg">Z</span>
              </div>
              <span className="text-xl font-bold">Zenovia</span>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1 rounded-md hover:bg-primary-800 transition-colors"
          >
            <ChevronLeft
              size={20}
              className={`transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>

          {isCollapsed && (
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-primary-900 font-bold text-lg">Z</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
                      ${isActive(item.path)
                        ? 'bg-coral-400 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-primary-800 hover:text-white'
                      }
                    `}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="ml-3 font-medium">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-primary-800">
          <button
            onClick={handleLogout}
            className={`
              flex items-center w-full px-3 py-2.5 rounded-lg
              text-gray-300 hover:bg-red-600 hover:text-white
              transition-all duration-200
            `}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;