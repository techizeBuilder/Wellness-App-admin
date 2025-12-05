import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Users, Calendar, IndianRupee, RefreshCw } from 'lucide-react';
import Card from '../components/Card';
import Chart, { CustomLineChart, CustomBarChart, CustomPieChart } from '../components/Chart';
import { apiGet } from '../utils/api';
import { formatCurrency } from '../utils/dummyData';
import toast from 'react-hot-toast';

const Reports = () => {
  const [dateRange, setDateRange] = useState('last30days');
  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState({
    stats: {
      totalUsers: 0,
      activeBookings: 0,
      monthlyRevenue: 0,
      conversionRate: '0.0'
    },
    growth: {
      users: 0,
      bookings: 0,
      revenue: 0
    },
    revenueData: [],
    userGrowthData: [],
    categoryData: [],
    monthlyActiveUsers: [],
    expertPerformance: [],
    bookingStats: {
      successRate: '0.0',
      successful: 0,
      cancelled: 0,
      noShows: 0
    },
    satisfaction: {
      average: '0.0',
      distribution: []
    },
    platformGrowth: {
      newUsers: 0,
      revenueGrowth: 0
    }
  });

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/api/admin/reports?dateRange=${dateRange}`);
      
      if (response.success && response.data) {
        setReportsData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch reports data');
      }
    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast.error(error?.message || 'Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const handleExportReport = () => {
    try {
      // Create a simple CSV export
      const csvData = [
        ['Report Type', 'Value'],
        ['Total Users', reportsData.stats.totalUsers],
        ['Active Bookings', reportsData.stats.activeBookings],
        ['Monthly Revenue', reportsData.stats.monthlyRevenue],
        ['Conversion Rate', `${reportsData.stats.conversionRate}%`],
        ['Booking Success Rate', `${reportsData.bookingStats.successRate}%`],
        ['Customer Satisfaction', `${reportsData.satisfaction.average}/5`]
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zenovia-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-primary-900" size={48} />
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your wellness platform</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            disabled={loading}
          >
            <option value="last7days">Last 7 days</option>
            <option value="last30days">Last 30 days</option>
            <option value="last90days">Last 90 days</option>
            <option value="last365days">Last 365 days</option>
          </select>
          <button 
            onClick={fetchReportsData}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
            <span>Refresh</span>
          </button>
          <button 
            onClick={handleExportReport}
            className="btn-primary flex items-center space-x-2"
            disabled={loading}
          >
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="text-primary-900" size={24} />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">{reportsData.stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Users</div>
              <div className={`text-xs flex items-center mt-1 ${reportsData.growth.users >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp size={12} className="mr-1" />
                {reportsData.growth.users >= 0 ? '+' : ''}{reportsData.growth.users}% vs previous period
              </div>
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-gold-100 rounded-lg">
              <Calendar className="text-gold-600" size={24} />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">{reportsData.stats.activeBookings}</div>
              <div className="text-sm text-gray-600">Active Bookings</div>
              <div className={`text-xs flex items-center mt-1 ${reportsData.growth.bookings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp size={12} className="mr-1" />
                {reportsData.growth.bookings >= 0 ? '+' : ''}{reportsData.growth.bookings}% vs previous period
              </div>
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-coral-100 rounded-lg">
              <IndianRupee className="text-coral-400" size={24} />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(reportsData.stats.monthlyRevenue)}</div>
              <div className="text-sm text-gray-600">Revenue ({dateRange.replace('last', '').replace('days', ' days')})</div>
              <div className={`text-xs flex items-center mt-1 ${reportsData.growth.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp size={12} className="mr-1" />
                {reportsData.growth.revenue >= 0 ? '+' : ''}{reportsData.growth.revenue}% vs previous period
              </div>
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">{reportsData.stats.conversionRate}%</div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
              <div className="text-xs text-gray-500 flex items-center mt-1">
                Based on completed bookings
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth */}
        <Chart title="Revenue Growth">
          {reportsData.revenueData.length > 0 ? (
            <CustomLineChart
              data={reportsData.revenueData}
              xDataKey="name"
              lines={[
                { dataKey: 'revenue', name: 'Revenue', color: '#004d4d' }
              ]}
              height={300}
              formatter={(value) => formatCurrency(value)}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No revenue data available for this period
            </div>
          )}
        </Chart>

        {/* User Growth */}
        <Chart title="User Growth">
          {reportsData.userGrowthData.length > 0 ? (
            <CustomLineChart
              data={reportsData.userGrowthData}
              xDataKey="name"
              lines={[
                { dataKey: 'users', name: 'Users', color: '#ff6f61' }
              ]}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No user growth data available for this period
            </div>
          )}
        </Chart>
      </div>

      {/* Category & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Chart title="Service Category Popularity">
          {reportsData.categoryData.length > 0 ? (
            <CustomPieChart
              data={reportsData.categoryData}
              height={300}
              colors={reportsData.categoryData.map(item => item.color)}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No category data available for this period
            </div>
          )}
        </Chart>

        {/* Monthly Active Users */}
        <Chart title="Monthly Active Users & Sessions">
          {reportsData.monthlyActiveUsers.length > 0 ? (
            <CustomBarChart
              data={reportsData.monthlyActiveUsers}
              xDataKey="name"
              bars={[
                { dataKey: 'users', name: 'Active Users', color: '#004d4d' },
                { dataKey: 'sessions', name: 'Sessions', color: '#ffd700' }
              ]}
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No active users data available for this period
            </div>
          )}
        </Chart>
      </div>

      {/* Expert Performance */}
      <Card title="Top Performing Experts">
        <div className="overflow-x-auto mt-4">
          <table className="w-full table-hover">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Expert</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Sessions</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenue</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Performance</th>
              </tr>
            </thead>
            <tbody>
              {reportsData.expertPerformance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No expert performance data available for this period
                  </td>
                </tr>
              ) : (
                reportsData.expertPerformance.map((expert, index) => {
                  const maxSessions = reportsData.expertPerformance.length > 0 
                    ? Math.max(...reportsData.expertPerformance.map(e => e.sessions))
                    : expert.sessions;
                  return (
                    <tr key={expert.name || index} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="font-medium text-gray-900">{expert.name}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900">{expert.sessions}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-green-600">{formatCurrency(expert.revenue)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="font-medium text-gold-600">{expert.rating.toFixed(1)}</span>
                          <span className="text-gray-400 ml-1">/ 5.0</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-900 h-2 rounded-full" 
                            style={{ width: `${maxSessions > 0 ? (expert.sessions / maxSessions) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Customer Satisfaction">
          <div className="mt-4 text-center">
            <div className="text-4xl font-bold text-primary-900 mb-2">{reportsData.satisfaction.average}</div>
            <div className="text-gray-600 mb-4">out of 5.0</div>
            <div className="space-y-2">
              {reportsData.satisfaction.distribution.length > 0 ? (
                reportsData.satisfaction.distribution.map((item) => (
                  <div key={item.rating} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 w-4">{item.rating}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gold-500 h-2 rounded-full" 
                        style={{ width: item.percentage }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8">
                      {item.percentage}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm py-4">No satisfaction data available</p>
              )}
            </div>
          </div>
        </Card>

        <Card title="Booking Success Rate">
          <div className="mt-4 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{reportsData.bookingStats.successRate}%</div>
            <div className="text-gray-600 mb-4">Success Rate</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Successful Bookings</span>
                <span className="font-medium">{reportsData.bookingStats.successful.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Cancelled Bookings</span>
                <span className="font-medium text-red-600">{reportsData.bookingStats.cancelled.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>No-shows</span>
                <span className="font-medium text-yellow-600">{reportsData.bookingStats.noShows.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Platform Growth">
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Users</span>
              <span className="font-semibold text-green-600">
                +{reportsData.platformGrowth.newUsers} in this period
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenue Growth</span>
              <span className={`font-semibold ${reportsData.platformGrowth.revenueGrowth >= 0 ? 'text-gold-600' : 'text-red-600'}`}>
                {reportsData.platformGrowth.revenueGrowth >= 0 ? '+' : ''}{reportsData.platformGrowth.revenueGrowth}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">User Growth</span>
              <span className={`font-semibold ${reportsData.growth.users >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportsData.growth.users >= 0 ? '+' : ''}{reportsData.growth.users}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Booking Growth</span>
              <span className={`font-semibold ${reportsData.growth.bookings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {reportsData.growth.bookings >= 0 ? '+' : ''}{reportsData.growth.bookings}%
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;