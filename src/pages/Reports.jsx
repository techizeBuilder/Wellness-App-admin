import React, { useState } from 'react';
import { Download, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import Card from '../components/Card';
import Chart, { CustomLineChart, CustomBarChart, CustomPieChart } from '../components/Chart';
import {
  dashboardStats,
  revenueData,
  categoryData,
  userGrowthData,
  formatCurrency
} from '../utils/dummyData';

const Reports = () => {
  const [dateRange, setDateRange] = useState('last30days');
  const [reportType, setReportType] = useState('overview');

  // Generate monthly active users data
  const monthlyActiveUsers = [
    { name: 'Jan', users: 1850, sessions: 4200 },
    { name: 'Feb', users: 2100, sessions: 4800 },
    { name: 'Mar', users: 2350, sessions: 5400 },
    { name: 'Apr', users: 2200, sessions: 5100 },
    { name: 'May', users: 2500, sessions: 5800 },
    { name: 'Jun', users: 2750, sessions: 6300 },
    { name: 'Jul', users: 2900, sessions: 6800 },
    { name: 'Aug', users: 2847, sessions: 6950 }
  ];

  const expertPerformanceData = [
    { name: 'Dr. Priya Sharma', sessions: 245, revenue: 98000, rating: 4.8 },
    { name: 'Nutritionist Maya', sessions: 189, revenue: 75600, rating: 4.9 },
    { name: 'Ayurveda Expert Ram', sessions: 167, revenue: 83500, rating: 4.7 },
    { name: 'Meditation Guru Anand', sessions: 134, revenue: 40200, rating: 4.9 },
    { name: 'Dr. Kavita Nair', sessions: 98, revenue: 39200, rating: 4.6 }
  ];

  const handleExportReport = () => {
    // This would typically generate and download a PDF/Excel report
    alert('Report exported successfully!');
  };

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
          >
            <option value="last7days">Last 7 days</option>
            <option value="last30days">Last 30 days</option>
            <option value="last90days">Last 90 days</option>
            <option value="last365days">Last 365 days</option>
          </select>
          <button 
            onClick={handleExportReport}
            className="btn-primary flex items-center space-x-2"
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
              <div className="text-2xl font-bold text-gray-900">{dashboardStats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Users</div>
              <div className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                +12% vs last month
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
              <div className="text-2xl font-bold text-gray-900">{dashboardStats.activeBookings}</div>
              <div className="text-sm text-gray-600">Active Bookings</div>
              <div className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                +8% vs last week
              </div>
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-coral-100 rounded-lg">
              <DollarSign className="text-coral-400" size={24} />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardStats.monthlyRevenue)}</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
              <div className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                +15% vs last month
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
              <div className="text-2xl font-bold text-gray-900">68.2%</div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
              <div className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp size={12} className="mr-1" />
                +5.2% vs last month
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth */}
        <Chart title="Revenue Growth">
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

        {/* User Growth */}
        <Chart title="User Growth">
          <CustomLineChart
            data={userGrowthData}
            xDataKey="name"
            lines={[
              { dataKey: 'users', name: 'Users', color: '#ff6f61' }
            ]}
            height={300}
          />
        </Chart>
      </div>

      {/* Category & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Chart title="Service Category Popularity">
          <CustomPieChart
            data={categoryData}
            height={300}
            colors={categoryData.map(item => item.color)}
          />
        </Chart>

        {/* Monthly Active Users */}
        <Chart title="Monthly Active Users & Sessions">
          <CustomBarChart
            data={monthlyActiveUsers}
            xDataKey="name"
            bars={[
              { dataKey: 'users', name: 'Active Users', color: '#004d4d' },
              { dataKey: 'sessions', name: 'Sessions', color: '#ffd700' }
            ]}
            height={300}
          />
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
              {expertPerformanceData.map((expert, index) => (
                <tr key={expert.name} className="border-b border-gray-100">
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
                      <span className="font-medium text-gold-600">{expert.rating}</span>
                      <span className="text-gray-400 ml-1">/ 5.0</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-900 h-2 rounded-full" 
                        style={{ width: `${(expert.sessions / 250) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Customer Satisfaction">
          <div className="mt-4 text-center">
            <div className="text-4xl font-bold text-primary-900 mb-2">4.8</div>
            <div className="text-gray-600 mb-4">out of 5.0</div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 w-4">{rating}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gold-500 h-2 rounded-full" 
                      style={{ width: rating === 5 ? '70%' : rating === 4 ? '25%' : '5%' }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 w-8">
                    {rating === 5 ? '70%' : rating === 4 ? '25%' : '5%'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Booking Success Rate">
          <div className="mt-4 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">94.5%</div>
            <div className="text-gray-600 mb-4">Success Rate</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Successful Bookings</span>
                <span className="font-medium">1,342</span>
              </div>
              <div className="flex justify-between">
                <span>Cancelled Bookings</span>
                <span className="font-medium text-red-600">78</span>
              </div>
              <div className="flex justify-between">
                <span>No-shows</span>
                <span className="font-medium text-yellow-600">23</span>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Platform Growth">
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New Users</span>
              <span className="font-semibold text-green-600">+127 this week</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Expert Applications</span>
              <span className="font-semibold text-blue-600">+12 pending</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenue Growth</span>
              <span className="font-semibold text-gold-600">+15% MoM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Market Share</span>
              <span className="font-semibold text-coral-400">23% in wellness</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;