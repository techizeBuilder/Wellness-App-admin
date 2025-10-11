import React, { useState } from 'react';
import { Search, Filter, Plus, Edit3, Trash2, Eye, Download } from 'lucide-react';
import Card from '../components/Card';
import { users, formatDate, formatCurrency, getStatusColor } from '../utils/dummyData';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const usersPerPage = 20;

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(user => user.id));
    }
  };

  const handleDeleteUser = (userId, userName) => {
    setUserToDelete({ id: userId, name: userName });
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = () => {
    console.log('Deleting user:', userToDelete.id);
    // Here you would typically make an API call to delete the user
    setShowDeleteModal(false);
    setUserToDelete(null);
    alert('User deleted successfully!');
  };

  const cancelDeleteUser = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = (updatedData) => {
    // Here you would typically make an API call to update the user
    console.log('Updating user:', selectedUser.id, updatedData);
    alert('User updated successfully!');
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }
    
    if (window.confirm(`Are you sure you want to ${action} ${selectedUsers.length} user(s)?`)) {
      console.log(`${action} users:`, selectedUsers);
      setSelectedUsers([]);
    }
  };

  // Add User Modal Component
  const AddUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
          <button 
            onClick={() => setShowAddModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <form className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" placeholder="Enter full name" />
          </div>
          <div>
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="Enter email address" />
          </div>
          <div>
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-input" placeholder="Enter phone number" />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-input">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Add User
            </button>
            <button 
              type="button" 
              onClick={() => setShowAddModal(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // View User Modal Component
  const ViewUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
          <button 
            onClick={() => {setShowViewModal(false); setSelectedUser(null);}}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {selectedUser.name.charAt(0)}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h4>
                <p className="text-gray-600">{selectedUser.id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <p className="text-gray-900">{selectedUser.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Join Date</label>
                <p className="text-gray-900">{formatDate(selectedUser.joinDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Total Bookings</label>
                <p className="text-gray-900">{selectedUser.totalBookings}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Total Spent</label>
                <p className="text-gray-900">{formatCurrency(selectedUser.totalSpent)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <span className={getStatusColor(selectedUser.status)}>
                  {selectedUser.status}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button 
                onClick={() => {setShowViewModal(false); setSelectedUser(null);}}
                className="btn-secondary flex-1"
              >
                Close
              </button>
              <button 
                onClick={() => {setShowViewModal(false); handleEditUser(selectedUser);}}
                className="btn-primary flex-1"
              >
                Edit User
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Edit User Modal Component
  const EditUserModal = () => {
    const [editForm, setEditForm] = useState({
      name: selectedUser?.name || '',
      email: selectedUser?.email || '',
      phone: selectedUser?.phone || '',
      status: selectedUser?.status || 'Active'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleUpdateUser(editForm);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
            <button 
              onClick={() => {setShowEditModal(false); setSelectedUser(null);}}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                placeholder="Enter full name" 
                required
              />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                placeholder="Enter email address" 
                required
              />
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                className="form-input" 
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                placeholder="Enter phone number" 
                required
              />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select 
                className="form-input"
                value={editForm.status}
                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button type="submit" className="btn-primary flex-1">
                Update User
              </button>
              <button 
                type="button" 
                onClick={() => {setShowEditModal(false); setSelectedUser(null);}}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal Component
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete <strong>{userToDelete?.name}</strong>? 
            This action cannot be undone and will permanently remove all associated data.
          </p>
          
          <div className="flex space-x-3">
            <button 
              onClick={cancelDeleteUser}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={confirmDeleteUser}
              className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
            >
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor user accounts</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Download size={16} />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-900">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'Active').length}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.status === 'Inactive').length}
            </div>
            <div className="text-sm text-gray-600">Inactive Users</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-gold-600">
              {formatCurrency(users.reduce((sum, u) => sum + u.totalSpent, 0))}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} selected
                </span>
                <button 
                  onClick={() => handleBulkAction('activate')}
                  className="btn-primary text-sm py-1 px-3"
                >
                  Activate
                </button>
                <button 
                  onClick={() => handleBulkAction('deactivate')}
                  className="btn-secondary text-sm py-1 px-3"
                >
                  Deactivate
                </button>
                <button 
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-600 text-white text-sm py-1 px-3 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-hover">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-3 px-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">User</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Contact</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Join Date</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Bookings</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Total Spent</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {formatDate(user.joinDate)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{user.totalBookings}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {formatCurrency(user.totalSpent)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={getStatusColor(user.status)}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="p-1 text-primary-900 hover:text-primary-700"
                        title="View User"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="p-1 text-gray-600 hover:text-gray-800"
                        title="Edit User"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="p-1 text-red-600 hover:text-red-800"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === i + 1
                      ? 'bg-primary-900 text-white border-primary-900'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Add User Modal */}
      {showAddModal && <AddUserModal />}
      
      {/* View User Modal */}
      {showViewModal && <ViewUserModal />}
      
      {/* Edit User Modal */}
      {showEditModal && <EditUserModal />}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  );
};

export default Users;