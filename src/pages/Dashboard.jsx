import React from 'react';
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import Card, { StatsCard } from '../components/Card';
import Chart, { CustomLineChart, CustomBarChart, CustomAreaChart } from '../components/Chart';
import {
  dashboardStats,
  revenueData,
  categoryData,
  userGrowthData,
  recentBookings,
  formatCurrency,
  formatDate,
  getStatusColor
} from '../utils/dummyData';

const Dashboard = () => {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with Zenovia today.</p>
        </div>
        <div className="mt-3 sm:mt-0">
          <button className="btn-primary">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard
          title="Total Users"
          value={dashboardStats.totalUsers.toLocaleString()}
          change="+12% from last month"
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="Total Experts"
          value={dashboardStats.totalExperts}
          change="+5% from last month"
          changeType="positive"
          icon={UserCheck}
        />
        <StatsCard
          title="Active Bookings"
          value={dashboardStats.activeBookings}
          change="+8% from last week"
          changeType="positive"
          icon={Calendar}
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(dashboardStats.monthlyRevenue)}
          change="+15% from last month"
          changeType="positive"
          icon={DollarSign}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        {/* Revenue Chart */}
        <Chart title="Revenue Trend" className="lg:col-span-1">
          <CustomAreaChart
            data={revenueData}
            xDataKey="name"
            areas={[
              { dataKey: 'revenue', name: 'Revenue', color: '#004d4d' }
            ]}
            height={300}
            formatter={(value) => formatCurrency(value)}
          />
        </Chart>

        {/* User Growth Chart */}
        <Chart title="User Growth" className="lg:col-span-1">
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

      {/* Category Performance & Bookings Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        {/* Bookings Bar Chart */}
        <div className="lg:col-span-2">
          <Chart title="Monthly Bookings">
            <CustomBarChart
              data={revenueData}
              xDataKey="name"
              bars={[
                { dataKey: 'bookings', name: 'Bookings', color: '#ffd700' }
              ]}
              height={300}
            />
          </Chart>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card title="Quick Stats" className="h-fit">
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-lg font-bold text-primary-900">68.2%</p>
                </div>
                <TrendingUp className="text-green-500" size={24} />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gold-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Session Value</p>
                  <p className="text-lg font-bold text-gold-600">{formatCurrency(1250)}</p>
                </div>
                <TrendingUp className="text-green-500" size={24} />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-coral-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                  <p className="text-lg font-bold text-coral-400">4.8/5</p>
                </div>
                <TrendingUp className="text-green-500" size={24} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Bookings */}
      <Card title="Recent Bookings" className="overflow-hidden">
        <div className="overflow-x-auto mt-4">
          <table className="w-full table-hover">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Booking ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Expert</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-primary-900">{booking.id}</td>
                  <td className="py-3 px-4 text-gray-900">{booking.user}</td>
                  <td className="py-3 px-4 text-gray-700">{booking.expert}</td>
                  <td className="py-3 px-4 text-gray-700">{booking.service}</td>
                  <td className="py-3 px-4 text-gray-700">
                    <div>
                      <div>{formatDate(booking.date)}</div>
                      <div className="text-sm text-gray-500">{booking.time}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={getStatusColor(booking.status)}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {formatCurrency(booking.amount)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="text-primary-900 hover:text-primary-700 text-sm font-medium">
                        View
                      </button>
                      <button className="text-coral-400 hover:text-coral-500 text-sm font-medium">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-center">
          <button className="btn-secondary">
            View All Bookings
          </button>
        </div>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Top Categories" className="md:col-span-1">
          <div className="mt-4 space-y-3">
            {categoryData.slice(0, 3).map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{category.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Expert Performance" className="md:col-span-2">
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">DP</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Dr. Priya Sharma</p>
                  <p className="text-sm text-gray-600">245 sessions • 4.8★</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(98000)}</p>
                <p className="text-sm text-green-600">+12% this month</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
                  <span className="text-primary-900 font-medium text-sm">NM</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Nutritionist Maya</p>
                  <p className="text-sm text-gray-600">189 sessions • 4.9★</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(75600)}</p>
                <p className="text-sm text-green-600">+8% this month</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;