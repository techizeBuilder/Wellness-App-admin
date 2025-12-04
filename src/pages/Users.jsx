import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import toast from 'react-hot-toast';
import config from '../utils/config';
import { apiGet, apiPut, apiDelete } from '../utils/api';
import { Users as UsersIcon, UserCheck, UserX, Plus, Eye, Edit, Trash2, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    newUsersThisMonth: 0
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 20;
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  // Helper function to get profile image URL
  const getProfileImageUrl = (user) => {
    if (!user) return null;
    
    // Check if profileImage exists
    if (user.profileImage) {
      // If it's already a full URL, return it
      if (user.profileImage.startsWith('http://') || user.profileImage.startsWith('https://')) {
        return user.profileImage;
      }
      // Otherwise, construct the full URL
      const apiUrl = config.getApiUrl();
      return `${apiUrl}/uploads/profiles/${user.profileImage}`;
    }
    
    // Fallback to googleAvatar if available
    if (user.googleAvatar) {
      return user.googleAvatar;
    }
    
    return null;
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      console.log('Fetching users with token:', token ? 'Token exists' : 'No token');
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: usersPerPage
      });
      
      const response = await fetch(`http://localhost:5000/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      console.log('Users API response:', data);
      
      // The API returns data in format: { success: true, data: { users: [...], pagination: {...} } }
      const users = data.data?.users || data.users || [];
      const pagination = data.data?.pagination || {};
      
      setUsers(users);
      setTotalPages(pagination.pages || 1);
      setTotalUsers(pagination.total || users.length);
      
      if (users && users.length > 0) {
        toast.success(`Loaded ${users.length} users`);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const response = await apiGet('/api/admin/users/stats');
      
      if (response.success && response.data?.stats) {
        setStats(response.data.stats);
      } else {
        throw new Error(response.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch stats: ' + (error.message || 'Unknown error'));
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage]);

  // Action handlers
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user: ' + error.message);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${user.id}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user status');
      }

      const result = await response.json();
      toast.success(result.message || 'User status updated successfully');
      fetchUsers(); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status: ' + error.message);
    }
  };

  // Handle form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setEditLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      const result = await response.json();
      toast.success('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      setEditFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      });
      fetchUsers(); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user: ' + error.message);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage user accounts and monitor user activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon size={24} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck size={24} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX size={24} className="text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Inactive Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactiveUsers || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Plus size={24} className="text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">New This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newUsersThisMonth || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading users...</span>
          </div>
        ) : (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Users List</h2>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">Users will appear here when they register</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Join Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id || user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                                </span>
                              </div>
                              {getProfileImageUrl(user) && (
                                <img
                                  src={getProfileImageUrl(user)}
                                  alt={user.name || 'User'}
                                  className="h-10 w-10 rounded-full object-cover absolute top-0 left-0"
                                  onError={(e) => {
                                    // Hide image and show initials if image fails to load
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">ID: {user.id || user._id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                              title="View User"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
                              title="Edit User"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => toggleUserStatus(user)}
                              className={`p-1 rounded-full ${
                                user.status === 'active' 
                                  ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-100' 
                                  : 'text-green-600 hover:text-green-900 hover:bg-green-100'
                              }`}
                              title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                            >
                              {user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center space-x-1"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">User Details</h3>
            {/* Profile Image */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-2xl font-medium text-white">
                    {selectedUser.name ? selectedUser.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </span>
                </div>
                {getProfileImageUrl(selectedUser) && (
                  <img
                    src={getProfileImageUrl(selectedUser)}
                    alt={selectedUser.name || 'User'}
                    className="h-24 w-24 rounded-full object-cover absolute top-0 left-0"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-medium text-gray-700">Name:</label>
                <p className="text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Email:</label>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Phone:</label>
                <p className="text-gray-900">{selectedUser.phone}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">User Type:</label>
                <p className="text-gray-900 capitalize">{selectedUser.userType}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Status:</label>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedUser.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedUser.status}
                </span>
              </div>
              <div>
                <label className="font-medium text-gray-700">Email Verified:</label>
                <p className="text-gray-900">{selectedUser.isEmailVerified ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Phone Verified:</label>
                <p className="text-gray-900">{selectedUser.isPhoneVerified ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Join Date:</label>
                <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
              {selectedUser.lastLogin && (
                <div>
                  <label className="font-medium text-gray-700">Last Login:</label>
                  <p className="text-gray-900">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={editFormData.firstName}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={editFormData.lastName}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    setEditFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: ''
                    });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={editLoading}
                >
                  {editLoading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete User</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete user <strong>{selectedUser.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
