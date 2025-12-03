import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import toast from 'react-hot-toast';
import config from '../utils/config';
import { 
  Users as UsersIcon, 
  UserCheck, 
  UserX, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  Star,
  Clock,
  DollarSign,
  X
} from 'lucide-react';

const Experts = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalExperts: 0,
    activeExperts: 0,
    inactiveExperts: 0,
    averageRating: 0
  });
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [expertPlans, setExpertPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  
  // Form states
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    experience: 0,
    bio: '',
    hourlyRate: 0,
    verificationStatus: 'approved'
  });
  const [editLoading, setEditLoading] = useState(false);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [specializations, setSpecializations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Helper function to get profile image URL
  const getProfileImageUrl = (expert) => {
    if (!expert) return null;
    
    // Check if profileImage exists
    if (expert.profileImage) {
      // If it's already a full URL, return it
      if (expert.profileImage.startsWith('http://') || expert.profileImage.startsWith('https://')) {
        return expert.profileImage;
      }
      // Otherwise, construct the full URL
      const apiUrl = config.getApiUrl();
      return `${apiUrl}/uploads/profiles/${expert.profileImage}`;
    }
    
    return null;
  };

  // Skeleton component
  const ExpertSkeleton = () => (
    <div className="animate-pulse">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="border-b border-gray-200 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/3"></div>
            </div>
            <div className="w-20 h-8 bg-gray-300 rounded"></div>
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Fetch experts from API
  const fetchExperts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        status: statusFilter,
        verificationStatus: verificationFilter
      });
      
      if (specializationFilter && specializationFilter !== 'all') {
        queryParams.append('specialty', specializationFilter);
      }
      
      const response = await fetch(`http://localhost:5000/api/admin/experts?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch experts');
      }

      const data = await response.json();
      const experts = data.data?.experts || data.experts || [];
      const pagination = data.data?.pagination || {};
      
      setExperts(experts);
      setTotalPages(pagination.totalPages || 1);
      
      if (experts && experts.length > 0) {
        toast.success(`Loaded ${experts.length} experts`);
      }
    } catch (error) {
      console.error('Error fetching experts:', error);
      toast.error('Failed to fetch experts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch expert statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('http://localhost:5000/api/admin/experts/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch stats');
      }

      const data = await response.json();
      const statsData = data.data?.stats || data.stats || {};
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch stats: ' + error.message);
    }
  };

  // Fetch unique specializations
  const fetchSpecializations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch all experts without pagination to get unique specializations
      const response = await fetch('http://localhost:5000/api/admin/experts?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch specializations');
      }

      const data = await response.json();
      const experts = data.data?.experts || data.experts || [];
      
      // Extract unique specializations
      const uniqueSpecializations = [...new Set(
        experts
          .map(expert => expert.specialization)
          .filter(spec => spec && spec.trim() !== '')
      )].sort();
      
      setSpecializations(uniqueSpecializations);
    } catch (error) {
      console.error('Error fetching specializations:', error);
      // Don't show error toast for this, just log it
    }
  };

  useEffect(() => {
    fetchExperts();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter, verificationFilter, specializationFilter]);

  useEffect(() => {
    fetchSpecializations();
  }, []);

  // Action handlers
  const handleViewExpert = async (expert) => {
    try {
      // Fetch full expert details including bank account
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/experts/${expert.id || expert._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedExpert(data.data?.expert || expert);
      } else {
        // If fetch fails, use the expert data we have
        setSelectedExpert(expert);
      }
    } catch (error) {
      console.error('Error fetching expert details:', error);
      // If error, use the expert data we have
      setSelectedExpert(expert);
    }
    setShowViewModal(true);
  };

  const handleEditExpert = (expert) => {
    setSelectedExpert(expert);
    setEditFormData({
      firstName: expert.firstName || '',
      lastName: expert.lastName || '',
      email: expert.email || '',
      phone: expert.phone || '',
      specialization: expert.specialization || '',
      experience: expert.experience || 0,
      bio: expert.bio || '',
      hourlyRate: expert.hourlyRate || 0,
      verificationStatus: expert.verificationStatus || 'approved'
    });
    setShowEditModal(true);
  };

  const handleDeleteExpert = (expert) => {
    setSelectedExpert(expert);
    setShowDeleteModal(true);
  };

  const confirmDeleteExpert = async () => {
    if (!selectedExpert) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/experts/${selectedExpert.id || selectedExpert._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete expert');
      }

      toast.success('Expert deleted successfully');
      setShowDeleteModal(false);
      setSelectedExpert(null);
      fetchExperts();
      fetchStats();
    } catch (error) {
      console.error('Error deleting expert:', error);
      toast.error('Failed to delete expert: ' + error.message);
    }
  };

  const toggleExpertStatus = async (expert) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`http://localhost:5000/api/admin/experts/${expert.id || expert._id}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update expert status');
      }

      const result = await response.json();
      toast.success(result.message || 'Expert status updated successfully');
      fetchExperts();
      fetchStats();
    } catch (error) {
      console.error('Error updating expert status:', error);
      toast.error('Failed to update expert status: ' + error.message);
    }
  };

  // Handle form input changes
  const handleEditFormChange = (e) => {
    const { name, value, type } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  // Submit edit form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExpert) return;

    try {
      setEditLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`http://localhost:5000/api/admin/experts/${selectedExpert.id || selectedExpert._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update expert');
      }

      toast.success('Expert updated successfully');
      setShowEditModal(false);
      setSelectedExpert(null);
      resetEditForm();
      fetchExperts();
      fetchStats();
    } catch (error) {
      console.error('Error updating expert:', error);
      toast.error('Failed to update expert: ' + error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const resetEditForm = () => {
    setEditFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialization: '',
      experience: 0,
      bio: '',
      hourlyRate: 0,
      verificationStatus: 'approved'
    });
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch plans for an expert
  const handleShowPlans = async (expert) => {
    try {
      setLoadingPlans(true);
      setSelectedExpert(expert);
      setShowPlansModal(true);
      
      const expertId = expert.id || expert._id;
      const apiUrl = config.getApiUrl();
      const response = await fetch(`${apiUrl}/api/plans/expert/${expertId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      
      const data = await response.json();
      setExpertPlans(data.data?.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to fetch plans: ' + error.message);
      setExpertPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Experts Management</h1>
        <p className="text-gray-600">Manage wellness experts and their profiles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon size={24} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Experts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalExperts || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck size={24} className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeExperts || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX size={24} className="text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactiveExperts || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star size={24} className="text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{(stats.averageRating || 0).toFixed(1)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search experts..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification</label>
            <select
              value={verificationFilter}
              onChange={(e) => {
                setVerificationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Verification</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
            <select
              value={specializationFilter}
              onChange={(e) => {
                setSpecializationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Experts Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <ExpertSkeleton />
          </div>
        ) : (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Experts List</h2>
            {experts.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No experts found</h3>
                <p className="text-gray-500">No experts match your current filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expert
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Specialization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Experience
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plans
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {experts.map((expert) => (
                      <tr key={expert.id || expert._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {expert.name ? expert.name.split(' ').map(n => n[0]).join('') : 'E'}
                                </span>
                              </div>
                              {getProfileImageUrl(expert) && (
                                <img
                                  src={getProfileImageUrl(expert)}
                                  alt={expert.name || 'Expert'}
                                  className="h-10 w-10 rounded-full object-cover absolute top-0 left-0"
                                  onError={(e) => {
                                    // Hide image and show initials if image fails to load
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{expert.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{expert.email || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{expert.specialization || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Clock size={16} className="mr-1 text-gray-400" />
                            {expert.experience || 0} years
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <DollarSign size={16} className="mr-1 text-gray-400" />
                            ${expert.hourlyRate || 0}/hr
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            expert.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {expert.status ? expert.status.charAt(0).toUpperCase() + expert.status.slice(1) : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getVerificationStatusColor(expert.verificationStatus)}`}>
                            {expert.verificationStatus ? expert.verificationStatus.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Approved'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleShowPlans(expert)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Show plans
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewExpert(expert)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                              title="View Expert"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEditExpert(expert)}
                              className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
                              title="Edit Expert"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => toggleExpertStatus(expert)}
                              className={`p-1 rounded-full ${
                                expert.status === 'active' 
                                  ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-100' 
                                  : 'text-green-600 hover:text-green-900 hover:bg-green-100'
                              }`}
                              title={expert.status === 'active' ? 'Deactivate Expert' : 'Activate Expert'}
                            >
                              {expert.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                            </button>
                            <button
                              onClick={() => handleDeleteExpert(expert)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                              title="Delete Expert"
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
          </div>
        )}
      </Card>

      {/* View Expert Modal */}
      {showViewModal && selectedExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Expert Details</h3>
            {/* Profile Image */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-2xl font-medium text-white">
                    {selectedExpert.name ? selectedExpert.name.split(' ').map(n => n[0]).join('') : 'E'}
                  </span>
                </div>
                {getProfileImageUrl(selectedExpert) && (
                  <img
                    src={getProfileImageUrl(selectedExpert)}
                    alt={selectedExpert.name || 'Expert'}
                    className="h-24 w-24 rounded-full object-cover absolute top-0 left-0"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-medium text-gray-700">Name:</label>
                <p className="text-gray-900">{selectedExpert.name}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Email:</label>
                <p className="text-gray-900">{selectedExpert.email}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Phone:</label>
                <p className="text-gray-900">{selectedExpert.phone}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Specialization:</label>
                <p className="text-gray-900">{selectedExpert.specialization}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Experience:</label>
                <p className="text-gray-900">{selectedExpert.experience} years</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Hourly Rate:</label>
                <p className="text-gray-900">${selectedExpert.hourlyRate}/hr</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Status:</label>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedExpert.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedExpert.status}
                </span>
              </div>
              <div>
                <label className="font-medium text-gray-700">Verification:</label>
                <span className={`px-2 py-1 text-xs rounded-full ${getVerificationStatusColor(selectedExpert.verificationStatus)}`}>
                  {selectedExpert.verificationStatus?.replace('_', ' ')}
                </span>
              </div>
              <div className="md:col-span-2">
                <label className="font-medium text-gray-700">Bio:</label>
                <p className="text-gray-900">{selectedExpert.bio || 'No bio provided'}</p>
              </div>
              <div>
                <label className="font-medium text-gray-700">Join Date:</label>
                <p className="text-gray-900">{new Date(selectedExpert.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            {/* Bank Account Details Section */}
            {selectedExpert.bankAccount && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <DollarSign size={18} className="mr-2" />
                  Bank Account Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                  <div>
                    <label className="font-medium text-gray-700">Account Holder Name:</label>
                    <p className="text-gray-900">{selectedExpert.bankAccount.accountHolderName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Account Number:</label>
                    <p className="text-gray-900 font-mono">{selectedExpert.bankAccount.accountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Bank Name:</label>
                    <p className="text-gray-900">{selectedExpert.bankAccount.bankName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">IFSC Code:</label>
                    <p className="text-gray-900 font-mono">{selectedExpert.bankAccount.ifscCode || 'N/A'}</p>
                  </div>
                  {selectedExpert.bankAccount.branchName && (
                    <div>
                      <label className="font-medium text-gray-700">Branch Name:</label>
                      <p className="text-gray-900">{selectedExpert.bankAccount.branchName}</p>
                    </div>
                  )}
                  <div>
                    <label className="font-medium text-gray-700">Account Type:</label>
                    <p className="text-gray-900 capitalize">{selectedExpert.bankAccount.accountType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Status:</label>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedExpert.bankAccount.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedExpert.bankAccount.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {!selectedExpert.bankAccount && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
                  <DollarSign size={18} className="mr-2" />
                  Bank Account Details
                </h4>
                <p className="text-gray-500 italic">No bank account details available</p>
              </div>
            )}
            
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

      {/* Edit Expert Modal */}
      {showEditModal && selectedExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Expert</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={editFormData.specialization}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={editFormData.experience}
                    onChange={handleEditFormChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={editFormData.hourlyRate}
                    onChange={handleEditFormChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Status
                  </label>
                  <select
                    name="verificationStatus"
                    value={editFormData.verificationStatus}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={editFormData.bio}
                  onChange={handleEditFormChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedExpert(null);
                    resetEditForm();
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
                  {editLoading ? 'Updating...' : 'Update Expert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete Expert</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete expert <strong>{selectedExpert.name}</strong>? 
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
                onClick={confirmDeleteExpert}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plans Modal */}
      {showPlansModal && selectedExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Plans for {selectedExpert.name || selectedExpert.firstName + ' ' + selectedExpert.lastName}
              </h3>
              <button
                onClick={() => {
                  setShowPlansModal(false);
                  setSelectedExpert(null);
                  setExpertPlans([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            {loadingPlans ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading plans...</p>
              </div>
            ) : expertPlans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No plans found for this expert</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expertPlans.map((plan) => (
                  <div key={plan._id || plan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          plan.type === 'monthly' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {plan.type === 'monthly' ? 'Monthly Subscription' : 'Single Class'}
                        </span>
                        {plan.isActive ? (
                          <span className="inline-block px-2 py-1 text-xs rounded-full ml-2 bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs rounded-full ml-2 bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ${plan.type === 'monthly' ? (plan.monthlyPrice || plan.price) : plan.price}
                        </p>
                        {plan.type === 'monthly' && (
                          <p className="text-sm text-gray-500">per month</p>
                        )}
                      </div>
                    </div>
                    
                    {plan.description && (
                      <p className="text-gray-600 mb-3">{plan.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {plan.duration && (
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <span className="ml-2 font-medium">{plan.duration} minutes</span>
                        </div>
                      )}
                      {plan.type === 'monthly' && plan.classesPerMonth && (
                        <div>
                          <span className="text-gray-500">Classes per month:</span>
                          <span className="ml-2 font-medium">{plan.classesPerMonth}</span>
                        </div>
                      )}
                      {plan.sessionClassType && (
                        <div>
                          <span className="text-gray-500">Class Type:</span>
                          <span className="ml-2 font-medium">{plan.sessionClassType}</span>
                        </div>
                      )}
                      {plan.sessionFormat && (
                        <div>
                          <span className="text-gray-500">Format:</span>
                          <span className="ml-2 font-medium capitalize">{plan.sessionFormat.replace('-', ' ')}</span>
                        </div>
                      )}
                      {plan.scheduledDate && (
                        <div>
                          <span className="text-gray-500">Scheduled Date:</span>
                          <span className="ml-2 font-medium">
                            {new Date(plan.scheduledDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {plan.scheduledTime && (
                        <div>
                          <span className="text-gray-500">Scheduled Time:</span>
                          <span className="ml-2 font-medium">{plan.scheduledTime}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="ml-2 font-medium">
                          {new Date(plan.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowPlansModal(false);
                  setSelectedExpert(null);
                  setExpertPlans([]);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Experts;
