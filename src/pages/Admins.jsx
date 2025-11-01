import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Key
} from 'lucide-react';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [permissions, setPermissions] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Dummy data for admins
  useEffect(() => {
    // Fetch admins from backend
    const fetchAdmins = async () => {
      try {
        const { apiGet } = await import('../utils/api');
        const res = await apiGet('/api/admin/admins');
        const adminsData = (res.data && res.data.admins) ? res.data.admins : [];
        // normalize to expected fields
        const normalized = adminsData.map(a => ({
          id: a._id || a.id,
          name: a.name,
          email: a.email,
          role: a.role === 'superadmin' ? 'super_admin' : 'admin',
          status: a.isActive ? 'active' : 'inactive',
          lastLogin: a.lastLogin || 'Never',
          createdAt: a.createdAt || new Date().toISOString(),
          avatar: '/Image/apple-touch-icon.png',
          permissions: a.permissions || []
        }));
        setAdmins(normalized);
        setFilteredAdmins(normalized);
      } catch (err) {
        console.error('Failed to fetch admins', err);
      }
    };

    fetchAdmins();
  }, []);

  // Fetch permissions for add/edit forms
  useEffect(() => {
    const fetchPerms = async () => {
      try {
        const { apiGet } = await import('../utils/api');
        const res = await apiGet('/api/admin/permissions');
        const perms = (res.data && res.data.permissions) ? res.data.permissions : [];
        setPermissions(perms);
      } catch (err) {
        console.error('Failed to fetch permissions', err);
      }
    };

    fetchPerms();
  }, []);

  // Filter admins based on search and role with pagination
  useEffect(() => {
    let filtered = admins.filter(admin =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (roleFilter !== 'all') {
      filtered = filtered.filter(admin => admin.role === roleFilter);
    }

    setTotalItems(filtered.length);
    
    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAdmins = filtered.slice(startIndex, endIndex);
    
    setFilteredAdmins(paginatedAdmins);
  }, [searchTerm, roleFilter, admins, currentPage, itemsPerPage]);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const getRoleIcon = (role) => {
    return role === 'super_admin' ? <ShieldCheck size={16} /> : <Shield size={16} />;
  };

  const getRoleBadge = (role) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1";
    if (role === 'super_admin') {
      return `${baseClasses} bg-purple-100 text-purple-800`;
    }
    return `${baseClasses} bg-blue-100 text-blue-800`;
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    if (status === 'active') {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    return `${baseClasses} bg-red-100 text-red-800`;
  };

  const getPermissionsDisplay = (adminPermissions = []) => {
    // Get permission labels for the admin's permission keys
    const adminPermissionLabels = adminPermissions.map(key => {
      const permission = permissions.find(p => p.key === key);
      return permission ? permission.label : key;
    }).filter(Boolean);

    if (adminPermissionLabels.length === 0) {
      return <span className="text-gray-400 text-sm">No permissions</span>;
    }

    if (adminPermissionLabels.length <= 2) {
      return (
        <div className="space-y-1">
          {adminPermissionLabels.map((label, index) => (
            <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-1">
              {label}
            </span>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-1">
          {adminPermissionLabels[0]}
        </span>
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-1">
          {adminPermissionLabels[1]}
        </span>
        {adminPermissionLabels.length > 2 && (
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            +{adminPermissionLabels.length - 2} more
          </span>
        )}
      </div>
    );
  };

  const handleAddAdmin = (adminData) => {
    // Call backend to create admin and return promise so caller can await
    return (async () => {
      try {
        const { apiPost } = await import('../utils/api');
        const payload = {
          name: adminData.name,
          email: adminData.email,
          role: adminData.role === 'super_admin' ? 'superadmin' : 'admin',
          permissions: adminData.permissions || [],
          // optionally pass password if provided
          ...(adminData.password ? { password: adminData.password } : {})
        };

        const res = await apiPost('/api/admin/admins', payload);
        const created = res.data && res.data.admin ? res.data.admin : null;
        if (created) {
          const normalized = {
            id: created._id || created.id,
            name: created.name,
            email: created.email,
            role: created.role === 'superadmin' ? 'super_admin' : 'admin',
            status: created.isActive !== false ? 'active' : 'inactive',
            lastLogin: created.lastLogin || 'Never',
            createdAt: created.createdAt || new Date().toISOString(),
            avatar: '/Image/apple-touch-icon.png',
            permissions: created.permissions || []
          };
          setAdmins(prev => [normalized, ...prev]);
          toast.success(`${created.name} has been added successfully! Welcome email sent.`);
        }
        return created;
      } catch (err) {
        console.error('Create admin failed', err);
        // rethrow so caller (modal) can display inline error
        throw err;
      }
    })();
  };

  const handleEditAdmin = (adminData) => {
    (async () => {
      try {
        const { apiPut } = await import('../utils/api');
        const id = selectedAdmin.id;
        const payload = {
          name: adminData.name,
          email: adminData.email,
          role: adminData.role === 'super_admin' ? 'superadmin' : 'admin',
          permissions: adminData.permissions || []
        };
        await apiPut(`/api/admin/admins/${id}`, payload);
        setAdmins(admins.map(admin => 
          admin.id === id ? { ...admin, ...adminData } : admin
        ));
        setShowEditModal(false);
        setSelectedAdmin(null);
        toast.success('Admin updated successfully!');
      } catch (err) {
        console.error('Update admin failed', err);
        toast.error((err && err.message) || 'Failed to update admin');
      }
    })();
  };

  const handleDeleteAdmin = (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    (async () => {
      try {
        const { apiDelete } = await import('../utils/api');
        await apiDelete(`/api/admin/admins/${adminId}`);
        setAdmins(admins.filter(admin => admin.id !== adminId));
        toast.success('Admin deleted successfully');
      } catch (err) {
        console.error('Delete admin failed', err);
        toast.error((err && err.message) || 'Failed to delete admin');
      }
    })();
  };

  const handleUpdatePassword = (adminData) => {
    const { newPassword, confirmPassword } = adminData;
    
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    (async () => {
      try {
        const { apiPut } = await import('../utils/api');
        await apiPut(`/api/admin/admins/${selectedAdmin.id}/password`, { newPassword });
        setShowUpdatePasswordModal(false);
        setSelectedAdmin(null);
        toast.success('Password updated successfully!');
      } catch (err) {
        console.error('Update password failed', err);
        toast.error((err && err.message) || 'Failed to update password');
      }
    })();
  };

  const toggleAdminStatus = (adminId) => {
    (async () => {
      try {
        const { apiPut } = await import('../utils/api');
        const admin = admins.find(a => a.id === adminId);
        if (!admin) return;
        const newStatus = admin.status === 'active' ? false : true;
        await apiPut(`/api/admin/admins/${adminId}`, { isActive: newStatus });
        setAdmins(admins.map(a => a.id === adminId ? { ...a, status: newStatus ? 'active' : 'inactive' } : a));
        toast.success(`Admin ${newStatus ? 'activated' : 'deactivated'} successfully`);
      } catch (err) {
        console.error('Toggle status failed', err);
        toast.error((err && err.message) || 'Failed to update status');
      }
    })();
  };

  // Pagination helpers
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Management</h1>
        <p className="text-gray-600">Manage super admins and admin users</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
          />
        </div>

        {/* Role Filter */}
        <div className="relative">
          <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 appearance-none bg-white"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Add Admin Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors"
        >
          <Plus size={20} />
          Add Admin
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShieldCheck size={24} className="text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Super Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {admins.filter(admin => admin.role === 'super_admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield size={24} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {admins.filter(admin => admin.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye size={24} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {admins.filter(admin => admin.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <EyeOff size={24} className="text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">
                {admins.filter(admin => admin.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={admin.avatar}
                        alt={admin.name}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                        <div className="text-sm text-gray-500">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getRoleBadge(admin.role)}>
                      {getRoleIcon(admin.role)}
                      {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      {getPermissionsDisplay(admin.permissions)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(admin.status)}>
                      {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {admin.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                        title="Edit Admin"
                      >
                        <Edit size={16} />
                      </button>
                      
                      {/* Update Password Button */}
                      <button
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setShowUpdatePasswordModal(true);
                        }}
                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-full transition-colors"
                        title="Update Password"
                      >
                        <Key size={16} />
                      </button>
                      
                      {/* Toggle Status Button */}
                      <button
                        onClick={() => toggleAdminStatus(admin.id)}
                        className={`p-2 rounded-full transition-colors ${
                          admin.status === 'active' 
                            ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50' 
                            : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                        }`}
                        title={admin.status === 'active' ? 'Deactivate Admin' : 'Activate Admin'}
                      >
                        {admin.status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Admin"
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

        {filteredAdmins.length === 0 && totalItems === 0 && (
          <div className="text-center py-12">
            <Shield size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No admins found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startItem}</span> to{' '}
                <span className="font-medium">{endItem}</span> of{' '}
                <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {/* Previous Button */}
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-coral-50 border-coral-500 text-coral-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {/* Show ellipsis if there are more pages */}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                    <button
                      onClick={() => goToPage(totalPages)}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                
                {/* Next Button */}
                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddModal && (
        <AddAdminModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddAdmin}
          permissions={permissions}
        />
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <EditAdminModal
          admin={selectedAdmin}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAdmin(null);
          }}
          onEdit={handleEditAdmin}
          permissions={permissions}
        />
      )}

      {/* Update Password Modal */}
      {showUpdatePasswordModal && selectedAdmin && (
        <UpdatePasswordModal
          admin={selectedAdmin}
          onClose={() => {
            setShowUpdatePasswordModal(false);
            setSelectedAdmin(null);
          }}
          onUpdate={handleUpdatePassword}
        />
      )}
    </div>
  );
};

// Add Admin Modal Component
const AddAdminModal = ({ onClose, onAdd, permissions = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    // Password optional: backend will generate a temp password if none provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      // onAdd returns a promise (it will throw on error)
      await onAdd({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: selectedPermissions,
        password: formData.password || undefined
      });
      // success: close modal
      onClose();
    } catch (err) {
      // try to extract helpful message from our fetch wrapper which throws the parsed body
      let msg = 'Failed to create admin';
      try {
        if (!err) msg = 'Failed to create admin';
        else if (typeof err === 'string') msg = err;
        else if (err.message) msg = err.message;
        else if (err.error) msg = err.error;
        else if (err.errors && Array.isArray(err.errors) && err.errors[0].msg) msg = err.errors[0].msg;
        else if (err.message) msg = err.message;
        else msg = JSON.stringify(err);
      } catch (e) {
        msg = 'Failed to create admin';
      }
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Admin</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              placeholder="Enter admin name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {permissions && permissions.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 p-3 rounded-lg bg-gray-50">
                {permissions.map(p => (
                  <label key={p._id || p.key} className="flex items-start gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(p.key)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedPermissions(prev => checked ? [...prev, p.key] : prev.filter(x => x !== p.key));
                      }}
                      className="mt-0.5 h-4 w-4 text-coral-600 focus:ring-coral-500 border-gray-300 rounded"
                    />
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{p.label}</div>
                      <div className="text-xs text-gray-500">{p.key}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password 
              <span className="text-xs text-gray-500 font-normal ml-1">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                placeholder="Leave empty to auto-generate"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              If left empty, a secure password will be generated and sent via email
            </p>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {formData.password && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                placeholder="Confirm password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-coral-500 hover:bg-coral-600'}`}
            >
              {submitting ? 'Adding...' : 'Add Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Admin Modal Component
const EditAdminModal = ({ admin, onClose, onEdit, permissions = [] }) => {
  const [formData, setFormData] = useState({
    name: admin.name,
    email: admin.email,
    role: admin.role
  });
  const [errors, setErrors] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState(admin.permissions || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onEdit({ ...formData, permissions: selectedPermissions });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Admin</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              placeholder="Enter admin name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {permissions && permissions.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 p-3 rounded-lg bg-gray-50">
                {permissions.map(p => (
                  <label key={p._id || p.key} className="flex items-start gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(p.key)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedPermissions(prev => checked ? [...prev, p.key] : prev.filter(x => x !== p.key));
                      }}
                      className="mt-0.5 h-4 w-4 text-coral-600 focus:ring-coral-500 border-gray-300 rounded"
                    />
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{p.label}</div>
                      <div className="text-xs text-gray-500">{p.key}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors"
            >
              Update Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Update Password Modal Component
const UpdatePasswordModal = ({ admin, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.newPassword || formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Update Password</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            Update password for <strong>{admin.name}</strong> ({admin.email})
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
              placeholder="Confirm new password"
              required
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admins;