import React, { useState } from 'react';
import { Search, Filter, Calendar, Clock, Check, X, Eye } from 'lucide-react';
import Card from '../components/Card';
import { bookings, formatDate, formatCurrency, getStatusColor } from '../utils/dummyData';

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const bookingsPerPage = 10;

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.expert.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const startIndex = (currentPage - 1) * bookingsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, startIndex + bookingsPerPage);

  const handleStatusUpdate = (bookingId, newStatus) => {
    if (window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this booking?`)) {
      console.log(`Updating booking ${bookingId} to ${newStatus}`);
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  const handleConfirmBooking = (booking) => {
    setSelectedBooking(booking);
    setShowConfirmModal(true);
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const confirmBookingAction = () => {
    console.log('Confirming booking:', selectedBooking.id);
    alert('Booking confirmed successfully!');
    setShowConfirmModal(false);
    setSelectedBooking(null);
  };

  const cancelBookingAction = () => {
    console.log('Cancelling booking:', selectedBooking.id);
    alert('Booking cancelled successfully!');
    setShowCancelModal(false);
    setSelectedBooking(null);
  };

  // View Booking Modal Component
  const ViewBookingModal = () => (
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
        
        {selectedBooking && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-primary-900">
                    Booking #{selectedBooking.id}
                  </h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary-900">
                    {formatCurrency(selectedBooking.amount)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Payment: {selectedBooking.paymentStatus}
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
                    <label className="text-sm font-medium text-gray-700">Service</label>
                    <p className="text-gray-900">{selectedBooking.service}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Expert</label>
                    <p className="text-gray-900">{selectedBooking.expert}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Duration</label>
                    <p className="text-gray-900">{selectedBooking.duration}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-3">Client & Schedule</h5>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Client</label>
                    <p className="text-gray-900">{selectedBooking.user}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <p className="text-gray-900">{formatDate(selectedBooking.date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Time</label>
                    <p className="text-gray-900">{selectedBooking.time}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              {selectedBooking.status === 'Pending' && (
                <>
                  <button 
                    onClick={() => {setShowViewModal(false); handleConfirmBooking(selectedBooking);}}
                    className="btn-primary flex-1"
                  >
                    Confirm Booking
                  </button>
                  <button 
                    onClick={() => {setShowViewModal(false); handleCancelBooking(selectedBooking);}}
                    className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel Booking
                  </button>
                </>
              )}
              <button 
                onClick={() => {setShowViewModal(false); setSelectedBooking(null);}}
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

  // Confirm Booking Modal Component
  const ConfirmBookingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Booking</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to confirm booking <strong>#{selectedBooking?.id}</strong> for 
            <strong> {selectedBooking?.user}</strong>?
          </p>
          
          {selectedBooking && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-left">
              <div className="text-sm text-gray-600">
                <div><strong>Service:</strong> {selectedBooking.service}</div>
                <div><strong>Expert:</strong> {selectedBooking.expert}</div>
                <div><strong>Date & Time:</strong> {formatDate(selectedBooking.date)} at {selectedBooking.time}</div>
                <div><strong>Amount:</strong> {formatCurrency(selectedBooking.amount)}</div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button 
              onClick={() => {setShowConfirmModal(false); setSelectedBooking(null);}}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={confirmBookingAction}
              className="flex-1 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Cancel Booking Modal Component
  const CancelBookingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <X className="w-6 h-6 text-red-600" />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Booking</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to cancel booking <strong>#{selectedBooking?.id}</strong> for 
            <strong> {selectedBooking?.user}</strong>? This action cannot be undone.
          </p>
          
          {selectedBooking && (
            <div className="bg-red-50 p-3 rounded-lg mb-4 text-left">
              <div className="text-sm text-gray-600">
                <div><strong>Service:</strong> {selectedBooking.service}</div>
                <div><strong>Expert:</strong> {selectedBooking.expert}</div>
                <div><strong>Date & Time:</strong> {formatDate(selectedBooking.date)} at {selectedBooking.time}</div>
                <div><strong>Amount:</strong> {formatCurrency(selectedBooking.amount)}</div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button 
              onClick={() => {setShowCancelModal(false); setSelectedBooking(null);}}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Keep Booking
            </button>
            <button 
              onClick={cancelBookingAction}
              className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
            >
              Cancel Booking
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
          <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all booking sessions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-900">{bookings.length}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'Confirmed').length}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'Pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {bookings.filter(b => b.status === 'Cancelled').length}
            </div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search bookings..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card className="overflow-hidden">
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
              {currentBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-primary-900">
                    {booking.id}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {booking.user}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {booking.expert}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {booking.service}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="text-gray-400" size={16} />
                      <div>
                        <div className="text-sm font-medium">{formatDate(booking.date)}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="mr-1" size={12} />
                          {booking.time}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {booking.duration}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {formatCurrency(booking.amount)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={getStatusColor(booking.status)}>
                      {booking.status}
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
                      
                      {booking.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => handleConfirmBooking(booking)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Confirm"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => handleCancelBooking(booking)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Booking Modal */}
      {showViewModal && <ViewBookingModal />}
      
      {/* Confirm Booking Modal */}
      {showConfirmModal && <ConfirmBookingModal />}
      
      {/* Cancel Booking Modal */}
      {showCancelModal && <CancelBookingModal />}
    </div>
  );
};

export default Bookings;