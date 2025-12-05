import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Clock, X, Eye, Loader2 } from 'lucide-react';
import Card from '../components/Card';
import { apiGet, apiPatch } from '../utils/api';
import { formatDate, formatCurrency } from '../utils/dummyData';
import config from '../utils/config';

const getStatusColor = (status) => {
  const statusColors = {
    'Pending': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    'Confirmed': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    'Completed': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
    'Cancelled': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
    'Rejected': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
  };
  return statusColors[status] || 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
};

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [specializations, setSpecializations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const bookingsPerPage = 10;

  // Fetch unique specializations
  const fetchSpecializations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = config.getApiUrl();
      
      // Fetch all experts without pagination to get unique specializations
      const response = await fetch(`${apiUrl}/api/admin/experts?limit=1000`, {
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
    }
  };

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [statusFilter, searchTerm, startDate, endDate, specializationFilter]);

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter, searchTerm, startDate, endDate, specializationFilter]);

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: bookingsPerPage.toString()
      });
      
      if (statusFilter !== 'All') {
        params.append('status', statusFilter);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (startDate) {
        params.append('startDate', startDate);
      }

      if (endDate) {
        params.append('endDate', endDate);
      }

      if (specializationFilter !== 'All') {
        params.append('specialization', specializationFilter);
      }

      const response = await apiGet(`/api/admin/bookings?${params.toString()}`);
      const appointments = response?.data?.appointments || [];
      const statsData = response?.data?.stats || stats;
      const paginationData = response?.data?.pagination || pagination;

      setBookings(appointments);
      setStats(statsData);
      setPagination(paginationData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert(error.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatBookingDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatBookingTime = (timeString) => {
    if (!timeString) return 'N/A';
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  const formatConsultationMethod = (method) => {
    const labels = {
      'video': 'Video Call',
      'audio': 'Audio Call',
      'chat': 'Chat',
      'in-person': 'In-Person'
    };
    return labels[method] || method;
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status;
  };

  const handleViewBooking = async (booking) => {
    try {
      const response = await apiGet(`/api/admin/bookings/${booking._id}`);
      setSelectedBooking(response?.data?.appointment || booking);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setSelectedBooking(booking);
      setShowViewModal(true);
    }
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setCancellationReason('');
    setShowCancelModal(true);
  };

  const cancelBookingAction = async () => {
    if (!selectedBooking) return;
    
    if (!cancellationReason || cancellationReason.trim().length === 0) {
      alert('Please provide a cancellation reason');
      return;
    }
    
    try {
      setUpdating(true);
      await apiPatch(`/api/admin/bookings/${selectedBooking._id}/status`, {
        status: 'cancelled',
        cancellationReason: cancellationReason.trim()
      });
      alert('Booking cancelled successfully!');
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancellationReason('');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(error.response?.data?.message || error.message || 'Failed to cancel booking');
    } finally {
      setUpdating(false);
    }
  };

  // View Booking Modal Component
  const ViewBookingModal = () => {
    if (!selectedBooking) return null;
    
    const user = selectedBooking.user || {};
    const expert = selectedBooking.expert || {};
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
    const expertName = `${expert.firstName || ''} ${expert.lastName || ''}`.trim() || 'N/A';
    const bookingId = selectedBooking._id?.substring(selectedBooking._id.length - 8).toUpperCase() || 'N/A';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
            <button 
              onClick={() => {setShowViewModal(false); setSelectedBooking(null);}}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-primary-900">
                    Booking #{bookingId}
                  </h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getStatusDisplay(selectedBooking.status))}`}>
                    {getStatusDisplay(selectedBooking.status)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary-900">
                    ₹{selectedBooking.price || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Duration: {selectedBooking.duration || 0} min
                  </div>
                </div>
              </div>
            </div>
            
            {/* Booking Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-3">Session Details</h5>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Service Format</label>
                    <p className="text-gray-900">{formatConsultationMethod(selectedBooking.consultationMethod)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Session Type</label>
                    <p className="text-gray-900">{selectedBooking.sessionType === 'one-on-one' ? 'One-on-One' : 'Group Session'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Expert</label>
                    <p className="text-gray-900">{expertName}</p>
                    {expert.specialization && (
                      <p className="text-sm text-gray-600">{expert.specialization}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Duration</label>
                    <p className="text-gray-900">{selectedBooking.duration} minutes</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-3">Client & Schedule</h5>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Client</label>
                    <p className="text-gray-900">{userName}</p>
                    {user.email && (
                      <p className="text-sm text-gray-600">{user.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <p className="text-gray-900">{formatBookingDate(selectedBooking.sessionDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Time</label>
                    <p className="text-gray-900">{formatBookingTime(selectedBooking.startTime)} - {formatBookingTime(selectedBooking.endTime)}</p>
                  </div>
                  {selectedBooking.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notes</label>
                      <p className="text-gray-900">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {selectedBooking.cancellationReason && (
              <div className="bg-red-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-red-700">Cancellation Reason</label>
                <p className="text-red-900">{selectedBooking.cancellationReason}</p>
                {selectedBooking.cancelledBy && (
                  <p className="text-sm text-red-600 mt-1">Cancelled by: {selectedBooking.cancelledBy}</p>
                )}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                <button 
                  onClick={() => {setShowViewModal(false); handleCancelBooking(selectedBooking);}}
                  className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                >
                  Cancel Booking
                </button>
              )}
              <button 
                onClick={() => {setShowViewModal(false); setSelectedBooking(null);}}
                className="btn-secondary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Cancel Booking Modal Component
  const CancelBookingModal = () => {
    if (!selectedBooking) return null;
    const user = selectedBooking.user || {};
    const expert = selectedBooking.expert || {};
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
    const expertName = `${expert.firstName || ''} ${expert.lastName || ''}`.trim() || 'N/A';
    const bookingId = selectedBooking._id?.substring(selectedBooking._id.length - 8).toUpperCase() || 'N/A';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <X className="w-6 h-6 text-red-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Cancel Booking</h3>
            <p className="text-gray-600 mb-4 text-center">
              Are you sure you want to cancel booking <strong>#{bookingId}</strong> for 
              <strong> {userName}</strong>? This action cannot be undone.
            </p>
            
            <div className="bg-red-50 p-3 rounded-lg mb-4 text-left">
              <div className="text-sm text-gray-600">
                <div><strong>Service:</strong> {formatConsultationMethod(selectedBooking.consultationMethod)}</div>
                <div><strong>Expert:</strong> {expertName}</div>
                <div><strong>Date & Time:</strong> {formatBookingDate(selectedBooking.sessionDate)} at {formatBookingTime(selectedBooking.startTime)}</div>
                <div><strong>Amount:</strong> ₹{selectedBooking.price}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this booking (e.g., Emergency, Dispute, Policy violation, etc.)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={4}
                disabled={updating}
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be visible to the user and expert.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => {setShowCancelModal(false); setSelectedBooking(null); setCancellationReason('');}}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                disabled={updating}
              >
                Keep Booking
              </button>
              <button 
                onClick={cancelBookingAction}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                disabled={updating || !cancellationReason.trim()}
              >
                {updating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredBookings = bookings.filter(booking => {
    const user = booking.user || {};
    const expert = booking.expert || {};
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase();
    const expertName = `${expert.firstName || ''} ${expert.lastName || ''}`.trim().toLowerCase();
    const bookingId = booking._id?.toLowerCase() || '';
    
    const matchesSearch = !searchTerm || 
      userName.includes(searchTerm.toLowerCase()) ||
      expertName.includes(searchTerm.toLowerCase()) ||
      bookingId.includes(searchTerm.toLowerCase()) ||
      formatConsultationMethod(booking.consultationMethod).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || 
      getStatusDisplay(booking.status).toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all booking sessions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Status</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={specializationFilter}
                onChange={(e) => {
                  setSpecializationFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 flex-1">
                <Calendar className="text-gray-400" size={16} />
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Start Date"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="End Date"
                />
              </div>

              {(searchTerm || statusFilter !== 'All' || startDate || endDate || specializationFilter !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('All');
                    setStartDate('');
                    setEndDate('');
                    setSpecializationFilter('All');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
            <p className="mt-2 text-gray-600">Loading bookings...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full table-hover">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Booking ID</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">User</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Expert</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Service</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Date & Time</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Duration</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Amount</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-gray-500">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => {
                      const user = booking.user || {};
                      const expert = booking.expert || {};
                      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
                      const expertName = `${expert.firstName || ''} ${expert.lastName || ''}`.trim() || 'N/A';
                      const bookingId = booking._id?.substring(booking._id.length - 8).toUpperCase() || 'N/A';

                      return (
                        <tr key={booking._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-primary-900">
                            {bookingId}
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {userName}
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {expertName}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {formatConsultationMethod(booking.consultationMethod)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="text-gray-400" size={16} />
                              <div>
                                <div className="text-sm font-medium">{formatBookingDate(booking.sessionDate)}</div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Clock className="mr-1" size={12} />
                                  {formatBookingTime(booking.startTime)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {booking.duration} min
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900">
                            ₹{booking.price || 0}
                          </td>
                          <td className="py-3 px-4">
                            <span className={getStatusColor(getStatusDisplay(booking.status))}>
                              {getStatusDisplay(booking.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleViewBooking(booking)}
                                className="p-1 text-primary-900 hover:text-primary-700"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              
                              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                <button 
                                  onClick={() => handleCancelBooking(booking)}
                                  className="p-1 text-red-600 hover:text-red-800"
                                  title="Cancel Booking"
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * bookingsPerPage) + 1} to {Math.min(currentPage * bookingsPerPage, pagination.total)} of {pagination.total} bookings
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                    disabled={currentPage === pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* View Booking Modal */}
      {showViewModal && <ViewBookingModal />}
      
      {/* Cancel Booking Modal */}
      {showCancelModal && <CancelBookingModal />}
    </div>
  );
};

export default Bookings;
