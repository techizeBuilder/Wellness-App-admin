import React, { useState } from 'react';
import { Search, Filter, Plus, Edit3, Trash2, Eye, Star, Award, CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/Card';
import { experts, formatDate, getStatusColor } from '../utils/dummyData';

const Experts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExperts, setSelectedExperts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expertToDelete, setExpertToDelete] = useState(null);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(null);
  const expertsPerPage = 20;

  // Get unique categories
  const categories = ['All', ...new Set(experts.map(expert => expert.category))];

  // Filter experts
  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expert.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expert.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || expert.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || expert.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredExperts.length / expertsPerPage);
  const startIndex = (currentPage - 1) * expertsPerPage;
  const endIndex = startIndex + expertsPerPage;
  const currentExperts = filteredExperts.slice(startIndex, endIndex);

  const handleApproveExpert = (expertId) => {
    if (window.confirm('Are you sure you want to approve this expert?')) {
      console.log('Approving expert:', expertId);
      alert('Expert approved successfully!');
    }
  };

  const handleBlockExpert = (expertId) => {
    if (window.confirm('Are you sure you want to block this expert?')) {
      console.log('Blocking expert:', expertId);
      alert('Expert blocked successfully!');
    }
  };

  const handleViewExpert = (expert) => {
    setSelectedExpert(expert);
    setShowViewModal(true);
  };

  const handleEditExpert = (expert) => {
    setSelectedExpert(expert);
    setShowEditModal(true);
  };

  const handleDeleteExpert = (expertId, expertName) => {
    setExpertToDelete({ id: expertId, name: expertName });
    setShowDeleteModal(true);
  };

  const confirmDeleteExpert = () => {
    console.log('Deleting expert:', expertToDelete.id);
    // Here you would make API call to delete the expert
    setShowDeleteModal(false);
    setExpertToDelete(null);
    // Show success notification (you can replace alert with a toast notification)
    alert('Expert deleted successfully!');
  };

  const cancelDeleteExpert = () => {
    setShowDeleteModal(false);
    setExpertToDelete(null);
  };

  const handleAddExpert = (expertData) => {
    console.log('Adding new expert:', expertData);
    alert('Expert added successfully!');
    setShowAddModal(false);
  };

  const handleUpdateExpert = (updatedData) => {
    console.log('Updating expert:', selectedExpert.id, updatedData);
    alert('Expert updated successfully!');
    setShowEditModal(false);
    setSelectedExpert(null);
  };

  // Expert Profile Modal
  const ExpertProfileModal = ({ expert, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Expert Profile</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {expert.name.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900">{expert.name}</h4>
              <p className="text-gray-600">{expert.category} Expert</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center">
                  <Star className="text-yellow-400 fill-current" size={16} />
                  <span className="ml-1 font-medium">{expert.rating}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600">{expert.totalSessions} sessions</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Contact Information</h5>
              <div className="space-y-2">
                <p><span className="text-gray-600">Email:</span> {expert.email}</p>
                <p><span className="text-gray-600">Phone:</span> {expert.phone}</p>
                <p><span className="text-gray-600">Join Date:</span> {formatDate(expert.joinDate)}</p>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Professional Info</h5>
              <div className="space-y-2">
                <p><span className="text-gray-600">Experience:</span> {expert.experience}</p>
                <p><span className="text-gray-600">Category:</span> {expert.category}</p>
                <p><span className="text-gray-600">Specialization:</span> {expert.specialization}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-900">{expert.rating}</div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
            <div className="text-center p-4 bg-gold-50 rounded-lg">
              <div className="text-2xl font-bold text-gold-600">{expert.totalSessions}</div>
              <div className="text-sm text-gray-600">Sessions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{expert.status}</div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            {expert.status === 'Active' ? (
              <button 
                onClick={() => handleBlockExpert(expert.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Block Expert
              </button>
            ) : (
              <button 
                onClick={() => handleApproveExpert(expert.id)}
                className="btn-primary"
              >
                Approve Expert
              </button>
            )}
            <button className="btn-secondary">
              Edit Profile
            </button>
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Add Expert Modal Component
  const AddExpertModal = () => {
    const [addForm, setAddForm] = useState({
      name: '',
      email: '',
      phone: '',
      category: 'Yoga',
      experience: '',
      specialization: '',
      bio: '',
      qualification: '',
      rating: '',
      status: 'Active'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleAddExpert(addForm);
      setAddForm({
        name: '',
        email: '',
        phone: '',
        category: 'Yoga',
        experience: '',
        specialization: '',
        bio: '',
        qualification: '',
        rating: '',
        status: 'Active'
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Add New Expert</h3>
            <button 
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={addForm.name}
                  onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                  placeholder="Enter expert's full name" 
                  required
                />
              </div>
              <div>
                <label className="form-label">Email Address *</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={addForm.email}
                  onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                  placeholder="Enter email address" 
                  required
                />
              </div>
              <div>
                <label className="form-label">Phone Number *</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  value={addForm.phone}
                  onChange={(e) => setAddForm({...addForm, phone: e.target.value})}
                  placeholder="Enter phone number" 
                  required
                />
              </div>
              <div>
                <label className="form-label">Category *</label>
                <select 
                  className="form-input"
                  value={addForm.category}
                  onChange={(e) => setAddForm({...addForm, category: e.target.value})}
                  required
                >
                  <option value="Yoga">Yoga</option>
                  <option value="Diet & Nutrition">Diet & Nutrition</option>
                  <option value="Ayurveda">Ayurveda</option>
                  <option value="Meditation">Meditation</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Mental Health">Mental Health</option>
                </select>
              </div>
              <div>
                <label className="form-label">Experience *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={addForm.experience}
                  onChange={(e) => setAddForm({...addForm, experience: e.target.value})}
                  placeholder="e.g. 5 years" 
                  required
                />
              </div>
              <div>
                <label className="form-label">Initial Rating</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={addForm.rating}
                  onChange={(e) => setAddForm({...addForm, rating: e.target.value})}
                  placeholder="4.5" 
                  min="1" 
                  max="5" 
                  step="0.1"
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Specialization *</label>
              <input 
                type="text" 
                className="form-input" 
                value={addForm.specialization}
                onChange={(e) => setAddForm({...addForm, specialization: e.target.value})}
                placeholder="e.g. Hatha Yoga, Pranayama" 
                required
              />
            </div>
            
            <div>
              <label className="form-label">Qualification</label>
              <input 
                type="text" 
                className="form-input" 
                value={addForm.qualification}
                onChange={(e) => setAddForm({...addForm, qualification: e.target.value})}
                placeholder="e.g. Certified Yoga Instructor, B.Sc Nutrition" 
              />
            </div>
            
            <div>
              <label className="form-label">Bio/Description</label>
              <textarea 
                className="form-input min-h-[100px]" 
                value={addForm.bio}
                onChange={(e) => setAddForm({...addForm, bio: e.target.value})}
                placeholder="Brief description about the expert..."
                rows="4"
              />
            </div>
            
            <div>
              <label className="form-label">Status</label>
              <select 
                className="form-input"
                value={addForm.status}
                onChange={(e) => setAddForm({...addForm, status: e.target.value})}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending Approval</option>
              </select>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button type="submit" className="btn-primary flex-1">
                Add Expert
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
  };

  // View Expert Modal Component
  const ViewExpertModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Expert Details</h3>
          <button 
            onClick={() => {setShowViewModal(false); setSelectedExpert(null);}}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        {selectedExpert && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center space-x-6 p-4 bg-gray-50 rounded-lg">
              <div className="w-20 h-20 bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {selectedExpert.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900">{selectedExpert.name}</h4>
                <p className="text-gray-600">{selectedExpert.id}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {selectedExpert.category}
                  </span>
                  <span className={getStatusColor(selectedExpert.status)}>
                    {selectedExpert.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-bold text-gray-900">{selectedExpert.rating}</span>
                </div>
                <p className="text-sm text-gray-600">{selectedExpert.totalSessions} sessions</p>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h5>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedExpert.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{selectedExpert.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Join Date</label>
                    <p className="text-gray-900">{formatDate(selectedExpert.joinDate)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-3">Professional Details</h5>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Experience</label>
                    <p className="text-gray-900">{selectedExpert.experience}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Specialization</label>
                    <p className="text-gray-900">{selectedExpert.specialization}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Total Sessions</label>
                    <p className="text-gray-900">{selectedExpert.totalSessions}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button 
                onClick={() => {setShowViewModal(false); handleEditExpert(selectedExpert);}}
                className="btn-primary flex-1"
              >
                Edit Expert
              </button>
              <button 
                onClick={() => {setShowViewModal(false); setSelectedExpert(null);}}
                className="btn-secondary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Edit Expert Modal Component
  const EditExpertModal = () => {
    const [editForm, setEditForm] = useState({
      name: selectedExpert?.name || '',
      email: selectedExpert?.email || '',
      phone: selectedExpert?.phone || '',
      category: selectedExpert?.category || 'Yoga',
      experience: selectedExpert?.experience || '',
      specialization: selectedExpert?.specialization || '',
      rating: selectedExpert?.rating || '',
      status: selectedExpert?.status || 'Active'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleUpdateExpert(editForm);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Edit Expert</h3>
            <button 
              onClick={() => {setShowEditModal(false); setSelectedExpert(null);}}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  placeholder="Enter expert's full name" 
                  required
                />
              </div>
              <div>
                <label className="form-label">Email Address *</label>
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
                <label className="form-label">Phone Number *</label>
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
                <label className="form-label">Category *</label>
                <select 
                  className="form-input"
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  required
                >
                  <option value="Yoga">Yoga</option>
                  <option value="Diet & Nutrition">Diet & Nutrition</option>
                  <option value="Ayurveda">Ayurveda</option>
                  <option value="Meditation">Meditation</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Mental Health">Mental Health</option>
                </select>
              </div>
              <div>
                <label className="form-label">Experience *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editForm.experience}
                  onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                  placeholder="e.g. 5 years" 
                  required
                />
              </div>
              <div>
                <label className="form-label">Rating</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={editForm.rating}
                  onChange={(e) => setEditForm({...editForm, rating: e.target.value})}
                  placeholder="4.5" 
                  min="1" 
                  max="5" 
                  step="0.1"
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Specialization *</label>
              <input 
                type="text" 
                className="form-input" 
                value={editForm.specialization}
                onChange={(e) => setEditForm({...editForm, specialization: e.target.value})}
                placeholder="e.g. Hatha Yoga, Pranayama" 
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
                <option value="Pending">Pending Approval</option>
              </select>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button type="submit" className="btn-primary flex-1">
                Update Expert
              </button>
              <button 
                type="button" 
                onClick={() => {setShowEditModal(false); setSelectedExpert(null);}}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Expert</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete <strong>{expertToDelete?.name}</strong>? 
            This action cannot be undone and will permanently remove all associated data.
          </p>
          
          <div className="flex space-x-3">
            <button 
              onClick={cancelDeleteExpert}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={confirmDeleteExpert}
              className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
            >
              Delete Expert
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
          <h1 className="text-2xl font-bold text-gray-900">Experts Management</h1>
          <p className="text-gray-600 mt-1">Manage wellness experts and their profiles</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Expert</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-900">{experts.length}</div>
            <div className="text-sm text-gray-600">Total Experts</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {experts.filter(e => e.status === 'Active').length}
            </div>
            <div className="text-sm text-gray-600">Active Experts</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-gold-600">
              {(experts.reduce((sum, e) => sum + e.rating, 0) / experts.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-coral-400">
              {experts.reduce((sum, e) => sum + e.totalSessions, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search experts..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Category Filter */}
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            {/* Status Filter */}
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Experts Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-hover">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Expert</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Category</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Experience</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Rating</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Sessions</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentExperts.map((expert) => (
                <tr key={expert.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {expert.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{expert.name}</div>
                        <div className="text-sm text-gray-500">{expert.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {expert.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {expert.experience}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Star className="text-yellow-400 fill-current mr-1" size={16} />
                      <span className="font-medium">{expert.rating}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Award className="text-gold-500 mr-1" size={16} />
                      <span className="font-medium">{expert.totalSessions}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={getStatusColor(expert.status)}>
                      {expert.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewExpert(expert)}
                        className="p-2 text-primary-900 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Expert Details"
                      >
                        <Eye size={16} />
                      </button>
                      
                      <button 
                        onClick={() => handleEditExpert(expert)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Edit Expert"
                      >
                        <Edit3 size={16} />
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteExpert(expert.id, expert.name)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Expert"
                      >
                        <Trash2 size={16} />
                      </button>
                      
                      {expert.status === 'Active' ? (
                        <button 
                          onClick={() => handleBlockExpert(expert.id)}
                          className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Block Expert"
                        >
                          <XCircle size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleApproveExpert(expert.id)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve Expert"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
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
              Showing {startIndex + 1} to {Math.min(endIndex, filteredExperts.length)} of {filteredExperts.length} experts
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === i + 1
                      ? 'bg-primary-900 text-white'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Expert Profile Modal */}
      {showProfileModal && (
        <ExpertProfileModal 
          expert={showProfileModal} 
          onClose={() => setShowProfileModal(null)} 
        />
      )}
      
      {/* Add Expert Modal */}
      {showAddModal && <AddExpertModal />}
      
      {/* View Expert Modal */}
      {showViewModal && <ViewExpertModal />}
      
      {/* Edit Expert Modal */}
      {showEditModal && <EditExpertModal />}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  );
};

export default Experts;