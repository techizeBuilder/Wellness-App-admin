import React, { useState } from 'react';
import { Search, Download, CreditCard, Banknote } from 'lucide-react';
import Card from '../components/Card';
import Chart, { CustomLineChart } from '../components/Chart';
import { payments, revenueData, formatDate, formatCurrency, getStatusColor } from '../utils/dummyData';

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 10;

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments.reduce((sum, p) => p.status === 'Completed' ? sum + p.amount : sum, 0);
  const pendingAmount = payments.reduce((sum, p) => p.status === 'Pending' ? sum + p.amount : sum, 0);
  const refundedAmount = payments.reduce((sum, p) => p.status === 'Refunded' ? sum + p.amount : sum, 0);

  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
  const startIndex = (currentPage - 1) * paymentsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, startIndex + paymentsPerPage);

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
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-red-600">{formatCurrency(refundedAmount)}</div>
            <div className="text-sm text-gray-600">Refunded</div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary-900">{payments.length}</div>
            <div className="text-sm text-gray-600">Total Transactions</div>
          </div>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Chart title="Revenue Trend">
        <CustomLineChart
          data={revenueData}
          xDataKey="name"
          lines={[
            { dataKey: 'revenue', name: 'Revenue', color: '#004d4d' }
          ]}
          height={300}
          formatter={(value) => formatCurrency(value)}
        />
      </Chart>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search payments..."
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
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
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
                    <div className="flex space-x-2">
                      <button className="text-primary-900 hover:text-primary-700 text-sm font-medium">
                        View
                      </button>
                      {payment.status === 'Completed' && (
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Refund
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
              Showing {startIndex + 1} to {Math.min(startIndex + paymentsPerPage, filteredPayments.length)} of {filteredPayments.length} payments
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
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

      {/* Payment Methods Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>
    </div>
  );
};

export default Payments;