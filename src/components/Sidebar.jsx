import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  Shield
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const [userRole, setUserRole] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Load user permissions from localStorage
  useEffect(() => {
    try {
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      setUserPermissions(adminUser.permissions || []);
      setUserRole(adminUser.role || '');
    } catch (err) {
      console.error('Failed to parse admin user data:', err);
    }
  }, []);

  // Define menu items with required permissions
  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard, permission: null }, // Always visible
    { path: '/users', name: 'Users', icon: Users, permission: 'manage_users' },
    { path: '/experts', name: 'Experts', icon: UserCheck, permission: 'manage_experts' },
    { path: '/admins', name: 'Admin Management', icon: Shield, permission: 'manage_admins' },
    { path: '/bookings', name: 'Bookings', icon: Calendar, permission: 'manage_bookings' },
    { path: '/payments', name: 'Payments', icon: CreditCard, permission: 'manage_payments' },
    { path: '/subscriptions', name: 'Subscriptions', icon: Package, permission: 'manage_subscriptions' },
    { path: '/reports', name: 'Reports', icon: BarChart3, permission: 'view_reports' },
    { path: '/settings', name: 'Settings', icon: Settings, permission: 'manage_settings' },
  ];

  // Filter menu items based on permissions
  const getVisibleMenuItems = () => {
    return menuItems.filter(item => {
      // Dashboard is always visible
      if (!item.permission) return true;
      
      // Super admins can see everything
      if (userRole === 'superadmin') return true;
      
      // Regular admins can only see items they have permission for
      return userPermissions.includes(item.permission);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary-900 text-white rounded-lg shadow-lg"
        aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
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
              <img 
                src="/Image/apple-touch-icon.png" 
                alt="Zenovia Logo" 
                className="w-10 h-10 object-contain rounded-lg"
              />
              <span className="text-xl font-bold text-white">ZENOVIA</span>
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
            <img 
              src="/Image/apple-touch-icon.png" 
              alt="Zenovia Logo" 
              className="w-8 h-8 object-contain rounded-lg mx-auto"
            />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            {getVisibleMenuItems().map((item) => {
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