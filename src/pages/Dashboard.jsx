import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Calendar, IndianRupee, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import Card, { StatsCard } from '../components/Card';
import Chart, { CustomLineChart, CustomBarChart, CustomAreaChart } from '../components/Chart';
import { apiGet } from '../utils/api';
import toast from 'react-hot-toast';
import {
  formatCurrency,
  formatDate,
  getStatusColor
} from '../utils/dummyData';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalExperts: 0,
      activeBookings: 0,
      monthlyRevenue: 0
    },
    growth: {
      users: 0,
      experts: 0,
      bookings: 0,
      revenue: 0
    },
    revenueData: [],
    userGrowthData: [],
    categoryData: [],
    recentBookings: [],
    topExperts: [],
    metrics: {
      conversionRate: '0.0',
      avgSessionValue: 0,
      customerSatisfaction: '0.0/5'
    }
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/api/admin/dashboard');

      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatGrowthChange = (percent) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent}% from last month`;
  };

  const getInitials = (name) => {
    if (!name) return 'E';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  const generateReport = () => {
    try {
      const reportDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const reportHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zenovia Dashboard Report - ${reportDate}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      padding: 40px 20px;
      background: #f9fafb;
    }
    .container { 
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header { 
      border-bottom: 3px solid #004d4d;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 { 
      color: #004d4d;
      font-size: 32px;
      margin-bottom: 10px;
    }
    .header .meta { 
      color: #6b7280;
      font-size: 14px;
    }
    .section { 
      margin: 30px 0;
    }
    .section h2 { 
      color: #004d4d;
      font-size: 24px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .stats-grid { 
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .stat-card { 
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #004d4d;
    }
    .stat-card h3 { 
      color: #6b7280;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .stat-card .value { 
      font-size: 32px;
      font-weight: 700;
      color: #004d4d;
      margin-bottom: 8px;
    }
    .stat-card .change { 
      font-size: 14px;
      font-weight: 500;
    }
    .positive { color: #10b981; }
    .negative { color: #ef4444; }
    table { 
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th { 
      background: #004d4d;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    td { 
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }
    tr:hover { background: #f9fafb; }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .metric-box {
      background: #fef3c7;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .metric-box .label {
      font-size: 12px;
      color: #92400e;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .metric-box .value {
      font-size: 24px;
      font-weight: 700;
      color: #004d4d;
    }
    .footer { 
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    @media print {
      body { padding: 0; background: white; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌿 Zenovia Wellness Dashboard Report</h1>
      <div class="meta">
        <p><strong>Generated:</strong> ${reportDate}</p>
        <p><strong>Report Type:</strong> Comprehensive Dashboard Analytics</p>
      </div>
    </div>

    <div class="section">
      <h2>📊 Key Performance Indicators</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Users</h3>
          <div class="value">${dashboardData.stats.totalUsers.toLocaleString()}</div>
          <div class="change ${dashboardData.growth.users >= 0 ? 'positive' : 'negative'}">
            ${dashboardData.growth.users >= 0 ? '↑' : '↓'} ${Math.abs(dashboardData.growth.users)}% from last month
          </div>
        </div>
        <div class="stat-card">
          <h3>Total Experts</h3>
          <div class="value">${dashboardData.stats.totalExperts.toLocaleString()}</div>
          <div class="change ${dashboardData.growth.experts >= 0 ? 'positive' : 'negative'}">
            ${dashboardData.growth.experts >= 0 ? '↑' : '↓'} ${Math.abs(dashboardData.growth.experts)}% from last month
          </div>
        </div>
        <div class="stat-card">
          <h3>Active Bookings</h3>
          <div class="value">${dashboardData.stats.activeBookings.toLocaleString()}</div>
          <div class="change ${dashboardData.growth.bookings >= 0 ? 'positive' : 'negative'}">
            ${dashboardData.growth.bookings >= 0 ? '↑' : '↓'} ${Math.abs(dashboardData.growth.bookings)}% from last month
          </div>
        </div>
        <div class="stat-card">
          <h3>Monthly Revenue</h3>
          <div class="value">${formatCurrency(dashboardData.stats.monthlyRevenue)}</div>
          <div class="change ${dashboardData.growth.revenue >= 0 ? 'positive' : 'negative'}">
            ${dashboardData.growth.revenue >= 0 ? '↑' : '↓'} ${Math.abs(dashboardData.growth.revenue)}% from last month
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>💡 Business Metrics</h2>
      <div class="metrics-grid">
        <div class="metric-box">
          <div class="label">Conversion Rate</div>
          <div class="value">${dashboardData.metrics.conversionRate}%</div>
        </div>
        <div class="metric-box">
          <div class="label">Avg Session Value</div>
          <div class="value">${formatCurrency(dashboardData.metrics.avgSessionValue)}</div>
        </div>
        <div class="metric-box">
          <div class="label">Customer Satisfaction</div>
          <div class="value">${dashboardData.metrics.customerSatisfaction}</div>
        </div>
      </div>
    </div>

    ${dashboardData.recentBookings.length > 0 ? `
    <div class="section">
      <h2>📅 Recent Bookings</h2>
      <table>
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>User</th>
            <th>Expert</th>
            <th>Service</th>
            <th>Date</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${dashboardData.recentBookings.map(booking => `
            <tr>
              <td><strong>${booking.id}</strong></td>
              <td>${booking.user}</td>
              <td>${booking.expert}</td>
              <td>${booking.service}</td>
              <td>${formatDate(booking.date)}<br><small>${booking.time}</small></td>
              <td><span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: ${booking.status === 'Confirmed' ? '#d1fae5' : booking.status === 'Pending' ? '#fef3c7' : '#fee2e2'}; color: ${booking.status === 'Confirmed' ? '#065f46' : booking.status === 'Pending' ? '#92400e' : '#991b1b'}">${booking.status}</span></td>
              <td><strong>${formatCurrency(booking.amount)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${dashboardData.topExperts.length > 0 ? `
    <div class="section">
      <h2>⭐ Top Performing Experts</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Expert Name</th>
            <th>Sessions</th>
            <th>Rating</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          ${dashboardData.topExperts.map((expert, index) => `
            <tr>
              <td><strong>#${index + 1}</strong></td>
              <td>${expert.name || 'Unknown Expert'}</td>
              <td>${expert.sessions || 0}</td>
              <td>${expert.rating ? expert.rating.toFixed(1) + ' ⭐' : 'N/A'}</td>
              <td><strong>${formatCurrency(expert.revenue || 0)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${dashboardData.categoryData.length > 0 ? `
    <div class="section">
      <h2>📈 Top Categories Performance</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Performance</th>
          </tr>
        </thead>
        <tbody>
          ${dashboardData.categoryData.slice(0, 5).map(category => `
            <tr>
              <td>${category.name}</td>
              <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="background: #e5e7eb; height: 20px; flex: 1; border-radius: 10px; overflow: hidden;">
                    <div style="background: ${category.color}; height: 100%; width: ${category.value}%; transition: width 0.3s;"></div>
                  </div>
                  <strong>${category.value}%</strong>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${dashboardData.revenueData.length > 0 ? `
    <div class="section">
      <h2>💰 Monthly Revenue Trend</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Revenue</th>
            <th>Bookings</th>
          </tr>
        </thead>
        <tbody>
          ${dashboardData.revenueData.map(item => `
            <tr>
              <td>${item.name}</td>
              <td><strong>${formatCurrency(item.revenue || 0)}</strong></td>
              <td>${item.bookings || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <div class="footer">
      <p><strong>Zenovia Wellness Platform</strong> - Admin Dashboard Report</p>
      <p>This report is confidential and intended for internal use only.</p>
      <p>© ${new Date().getFullYear()} Zenovia. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `;

      // Create blob and download
      const blob = new Blob([reportHTML], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Zenovia_Dashboard_Report_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Report generated successfully! Check your downloads.');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-primary-900" size={48} />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with Zenovia today.</p>
        </div>
        <div className="mt-3 sm:mt-0 flex space-x-2">
          <button
            onClick={fetchDashboardData}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={generateReport}
            className="btn-primary"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard
          title="Total Users"
          value={dashboardData.stats.totalUsers.toLocaleString()}
          change={formatGrowthChange(dashboardData.growth.users)}
          changeType={dashboardData.growth.users >= 0 ? "positive" : "negative"}
          icon={Users}
        />
        <StatsCard
          title="Total Experts"
          value={dashboardData.stats.totalExperts}
          change={formatGrowthChange(dashboardData.growth.experts)}
          changeType={dashboardData.growth.experts >= 0 ? "positive" : "negative"}
          icon={UserCheck}
        />
        <StatsCard
          title="Active Bookings"
          value={dashboardData.stats.activeBookings}
          change={formatGrowthChange(dashboardData.growth.bookings)}
          changeType={dashboardData.growth.bookings >= 0 ? "positive" : "negative"}
          icon={Calendar}
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(dashboardData.stats.monthlyRevenue)}
          change={formatGrowthChange(dashboardData.growth.revenue)}
          changeType={dashboardData.growth.revenue >= 0 ? "positive" : "negative"}
          icon={IndianRupee}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        {/* Revenue Chart */}
        <Chart title="Revenue Trend" className="lg:col-span-1">
          <CustomAreaChart
            data={dashboardData.revenueData}
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
            data={dashboardData.userGrowthData}
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
              data={dashboardData.revenueData}
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
                  <p className="text-lg font-bold text-primary-900">{dashboardData.metrics.conversionRate}%</p>
                </div>
                <TrendingUp className="text-green-500" size={24} />
              </div>

              <div className="flex items-center justify-between p-3 bg-gold-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Session Value</p>
                  <p className="text-lg font-bold text-gold-600">{formatCurrency(dashboardData.metrics.avgSessionValue)}</p>
                </div>
                <TrendingUp className="text-green-500" size={24} />
              </div>

              <div className="flex items-center justify-between p-3 bg-coral-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                  <p className="text-lg font-bold text-coral-400">{dashboardData.metrics.customerSatisfaction}</p>
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
              {dashboardData.recentBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    No recent bookings found
                  </td>
                </tr>
              ) : (
                dashboardData.recentBookings.map((booking) => (
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
                        <button
                          onClick={() => navigate('/bookings')}
                          className="text-primary-900 hover:text-primary-700 text-sm font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate('/bookings')}
                          className="text-coral-400 hover:text-coral-500 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={() => navigate('/bookings')}
            className="btn-secondary"
          >
            View All Bookings
          </button>
        </div>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Top Categories" className="md:col-span-1">
          <div className="mt-4 space-y-3">
            {dashboardData.categoryData.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No category data available</p>
            ) : (
              dashboardData.categoryData.slice(0, 3).map((category, index) => (
                <div key={category.name || index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{category.value}%</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Expert Performance" className="md:col-span-2">
          <div className="mt-4 space-y-3">
            {dashboardData.topExperts.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No expert performance data available</p>
            ) : (
              dashboardData.topExperts.map((expert, index) => {
                const colors = ['bg-primary-900', 'bg-gold-500', 'bg-coral-400', 'bg-green-500', 'bg-blue-500'];
                const initials = getInitials(expert.name);
                return (
                  <div key={expert.expertId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${colors[index % colors.length]} rounded-full flex items-center justify-center`}>
                        <span className={`font-medium text-sm ${index === 1 ? 'text-primary-900' : 'text-white'}`}>
                          {initials}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{expert.name || 'Unknown Expert'}</p>
                        <p className="text-sm text-gray-600">
                          {expert.sessions} sessions • {expert.rating ? `${expert.rating.toFixed(1)}★` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(expert.revenue || 0)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;