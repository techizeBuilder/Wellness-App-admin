import React, { useState, useEffect } from 'react';
import { Search, Download, CreditCard, Banknote, Eye, RefreshCw, DollarSign, Edit3, Loader2, Calendar, X } from 'lucide-react';
import Card from '../components/Card';
import Chart, { CustomLineChart } from '../components/Chart';
import { formatDate, formatCurrency, getStatusColor } from '../utils/dummyData';
import { apiGet, apiPatch } from '../utils/api';
import config from '../utils/config';

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [specializations, setSpecializations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    refundedAmount: 0,
    totalTransactions: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const paymentsPerPage = 20;

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
    // Reset to page 1 when filter or search changes
    setCurrentPage(1);
  }, [statusFilter, searchTerm, startDate, endDate, specializationFilter]);

  useEffect(() => {
    fetchPayments();
  }, [currentPage, statusFilter, searchTerm, startDate, endDate, specializationFilter]);

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: paymentsPerPage.toString()
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

      const response = await apiGet(`/api/admin/payments?${params.toString()}`);
      const paymentsData = response?.data?.payments || [];
      const statsData = response?.data?.stats || stats;
      const paginationData = response?.data?.pagination || pagination;

      // Transform payments to match UI format
      const transformedPayments = paymentsData.map(payment => transformPayment(payment));
      
      setPayments(transformedPayments);
      setStats(statsData);
      setPagination(paginationData);
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert(error.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const transformPayment = (payment) => {
    // Map status from DB format to UI format
    const statusMap = {
      'completed': 'Completed',
      'pending': 'Pending',
      'refunded': 'Refunded',
      'failed': 'Failed',
      'processing': 'Processing',
      'cancelled': 'Cancelled'
    };

    // Map payment method from DB format to UI format
    const methodMap = {
      'card': 'Credit Card',
      'upi': 'UPI',
      'wallet': 'Wallet',
      'netbanking': 'Net Banking',
      'other': 'Other'
    };

    // Get user name
    const userName = payment.user 
      ? `${payment.user.firstName || ''} ${payment.user.lastName || ''}`.trim() || payment.user.email
      : 'Unknown User';

    // Get service name
    let serviceName = 'Payment';
    if (payment.appointment) {
      serviceName = 'Appointment Session';
    } else if (payment.subscription) {
      serviceName = payment.subscription.planName || 'Subscription';
    } else if (payment.plan) {
      serviceName = payment.plan.name || 'Plan';
    }

    // Get transaction ID
    const transactionId = payment.razorpayPaymentId || payment.razorpayOrderId || payment._id.toString().slice(-8).toUpperCase();

    // Format date
    const paymentDate = payment.paidAt || payment.createdAt || new Date();

    return {
      id: payment._id,
      transactionId: transactionId,
      user: userName,
      amount: payment.amount,
      method: methodMap[payment.paymentMethod] || 'Other',
      date: paymentDate,
      status: statusMap[payment.status] || payment.status,
      service: serviceName,
      originalPayment: payment // Keep original for modals
    };
  };

  // Use payments directly since filtering is done server-side
  // Client-side filtering for search term (as fallback if API doesn't handle it well)
  const filteredPayments = payments.filter(payment => {
    if (searchTerm) {
      const matchesSearch = payment.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           payment.service.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
    }
    // Status filtering is done server-side, but we can also filter client-side as fallback
    if (statusFilter !== 'All' && payment.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const totalPages = pagination.pages || 1;
  const currentPayments = filteredPayments;

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'Credit Card':
      case 'Debit Card':
        return <CreditCard size={16} className="text-blue-600" />;
      case 'UPI':
        return <Banknote size={16} className="text-green-600" />;
      case 'Net Banking':
        return <Banknote size={16} className="text-purple-600" />;
      default:
        return <CreditCard size={16} className="text-gray-600" />;
    }
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const handleRefundPayment = (payment) => {
    setSelectedPayment(payment);
    setShowRefundModal(true);
  };

  const handleUpdateStatus = (payment) => {
    setSelectedPayment(payment);
    setShowStatusModal(true);
  };

  const processRefund = async () => {
    if (!selectedPayment?.originalPayment?._id) return;
    
    try {
      setUpdating(true);
      await apiPatch(`/api/admin/payments/${selectedPayment.originalPayment._id}/status`, {
        status: 'refunded'
      });
      alert('Refund processed successfully!');
      setShowRefundModal(false);
      setSelectedPayment(null);
      fetchPayments(); // Refresh the list
    } catch (error) {
      console.error('Error processing refund:', error);
      alert(error.message || 'Failed to process refund');
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (newStatus) => {
    if (!selectedPayment?.originalPayment?._id) return;
    
    // Map UI status to DB status
    const statusMap = {
      'Completed': 'completed',
      'Pending': 'pending',
      'Refunded': 'refunded',
      'Failed': 'failed',
      'Processing': 'processing',
      'Cancelled': 'cancelled'
    };
    
    const dbStatus = statusMap[newStatus] || newStatus.toLowerCase();
    
    try {
      setUpdating(true);
      await apiPatch(`/api/admin/payments/${selectedPayment.originalPayment._id}/status`, {
        status: dbStatus
      });
      alert(`Payment status updated to ${newStatus}`);
      setShowStatusModal(false);
      setSelectedPayment(null);
      fetchPayments(); // Refresh the list
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert(error.message || 'Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  // View Payment Modal Component
  const ViewPaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Payment Details</h3>
          <button 
            onClick={() => {setShowViewModal(false); setSelectedPayment(null);}}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        {selectedPayment && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-primary-900">
                    Transaction #{selectedPayment.transactionId}
                  </h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-900">
                    {formatCurrency(selectedPayment.amount)}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center justify-end">
                    {getPaymentMethodIcon(selectedPayment.method)}
                    <span className="ml-1">{selectedPayment.method}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-3">Transaction Details</h5>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Service</label>
                    <p className="text-gray-900">{selectedPayment.service}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">User</label>
                    <p className="text-gray-900">{selectedPayment.user}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Payment Method</label>
                    <div className="flex items-center space-x-2">
                      {getPaymentMethodIcon(selectedPayment.method)}
                      <span className="text-gray-900">{selectedPayment.method}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-3">Payment Info</h5>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Amount</label>
                    <p className="text-gray-900 font-semibold">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <p className="text-gray-900">{formatDate(selectedPayment.date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <span className={getStatusColor(selectedPayment.status)}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              {selectedPayment.status === 'Completed' && (
                <button 
                  onClick={() => {setShowViewModal(false); handleRefundPayment(selectedPayment);}}
                  className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                >
                  Process Refund
                </button>
              )}
              {selectedPayment.status !== 'Completed' && selectedPayment.status !== 'Refunded' && (
                <button 
                  onClick={() => {setShowViewModal(false); handleUpdateStatus(selectedPayment);}}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  Update Status
                </button>
              )}
              <button 
                onClick={() => {setShowViewModal(false); setSelectedPayment(null);}}
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

  // Refund Payment Modal Component
  const RefundPaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <DollarSign className="w-6 h-6 text-red-600" />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Process Refund</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to process a refund for transaction 
            <strong> #{selectedPayment?.transactionId}</strong>?
          </p>
          
          {selectedPayment && (
            <div className="bg-red-50 p-3 rounded-lg mb-4 text-left">
              <div className="text-sm text-gray-600">
                <div><strong>User:</strong> {selectedPayment.user}</div>
                <div><strong>Service:</strong> {selectedPayment.service}</div>
                <div><strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}</div>
                <div><strong>Payment Method:</strong> {selectedPayment.method}</div>
                <div><strong>Date:</strong> {formatDate(selectedPayment.date)}</div>
              </div>
            </div>
          )}
          
          <div className="text-red-600 text-sm mb-4">
            This action will initiate a refund to the original payment method.
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => {setShowRefundModal(false); setSelectedPayment(null);}}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={processRefund}
              disabled={updating}
              className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {updating ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Process Refund
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Status Update Modal Component
  const StatusUpdateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full">
          <RefreshCw className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Payment Status</h3>
          <p className="text-gray-600 mb-4">
            Update the status for transaction <strong>#{selectedPayment?.transactionId}</strong>
          </p>
          
          {selectedPayment && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4 text-left">
              <div className="text-sm text-gray-600">
                <div><strong>Current Status:</strong> 
                  <span className={`ml-2 ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </span>
                </div>
                <div><strong>User:</strong> {selectedPayment.user}</div>
                <div><strong>Amount:</strong> {formatCurrency(selectedPayment.amount)}</div>
              </div>
            </div>
          )}
          
          <div className="space-y-2 mb-4">
            <button 
              onClick={() => updatePaymentStatus('Completed')}
              disabled={updating}
              className="w-full px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {updating ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Mark as Completed
            </button>
            <button 
              onClick={() => updatePaymentStatus('Failed')}
              disabled={updating}
              className="w-full px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {updating ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Mark as Failed
            </button>
            <button 
              onClick={() => updatePaymentStatus('Pending')}
              disabled={updating}
              className="w-full px-4 py-2 text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {updating ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Mark as Pending
            </button>
          </div>
          
          <button 
            onClick={() => {setShowStatusModal(false); setSelectedPayment(null);}}
            className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all payment transactions</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="btn-secondary flex items-center space-x-2">
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingAmount)}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.refundedAmount)}</div>
            <div className="text-sm text-gray-600">Refunded</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-900">{stats.totalTransactions}</div>
            <div className="text-sm text-gray-600">Total Transactions</div>
          </div>
        </Card>
      </div>

      {/* Revenue Chart */}
      {/* <Chart title="Revenue Trend">
        <CustomLineChart
          data={revenueData}
          xDataKey="name"
          lines={[
            { dataKey: 'revenue', name: 'Revenue', color: '#004d4d' }
          ]}
          height={300}
          formatter={(value) => formatCurrency(value)}
        />
      </Chart> */}

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search payments..."
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
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Refunded">Refunded</option>
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

      {/* Payments Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary-600" size={32} />
              <span className="ml-3 text-gray-600">Loading payments...</span>
            </div>
          ) : currentPayments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No payments found</p>
            </div>
          ) : (
            <table className="w-full table-hover">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Transaction ID</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">User</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Service</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Amount</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Method</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Date</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="font-mono text-sm text-primary-900">
                      {payment.transactionId}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{payment.user}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {payment.service}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getPaymentMethodIcon(payment.method)}
                      <span className="text-sm">{payment.method}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {formatDate(payment.date)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={getStatusColor(payment.status)}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewPayment(payment)}
                        className="p-1 text-primary-900 hover:text-primary-700"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      
                      {payment.status === 'Completed' && (
                        <button 
                          onClick={() => handleRefundPayment(payment)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Process Refund"
                        >
                          <DollarSign size={16} />
                        </button>
                      )}
                      
                      {payment.status !== 'Completed' && payment.status !== 'Refunded' && (
                        <button 
                          onClick={() => handleUpdateStatus(payment)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Update Status"
                        >
                          <Edit3 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * paymentsPerPage) + 1} to {Math.min(currentPage * paymentsPerPage, pagination.total || filteredPayments.length)} of {pagination.total || filteredPayments.length} payments
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Payment Methods Distribution */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Payment Methods">
          <div className="mt-4 space-y-3">
            {['Credit Card', 'UPI', 'Debit Card', 'Net Banking'].map((method) => {
              const count = payments.filter(p => p.method === method).length;
              const percentage = ((count / payments.length) * 100).toFixed(1);
              return (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getPaymentMethodIcon(method)}
                    <span className="text-sm font-medium">{method}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{count}</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Recent Refunds">
          <div className="mt-4 space-y-3">
            {payments
              .filter(p => p.status === 'Refunded')
              .slice(0, 3)
              .map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{payment.user}</div>
                    <div className="text-sm text-gray-600">{payment.service}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">{formatCurrency(payment.amount)}</div>
                    <div className="text-xs text-gray-500">{formatDate(payment.date)}</div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div> */}

      {/* View Payment Modal */}
      {showViewModal && <ViewPaymentModal />}
      
      {/* Refund Payment Modal */}
      {showRefundModal && <RefundPaymentModal />}
      
      {/* Status Update Modal */}
      {showStatusModal && <StatusUpdateModal />}
    </div>
  );
};

export default Payments;