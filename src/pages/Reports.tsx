import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Filter } from 'lucide-react';

const Reports = () => {
  const [dateRange, setDateRange] = useState('last_30_days');
  const [reportType, setReportType] = useState('overview');

  const reportData = {
    overview: {
      totalBindingAdvice: 24,
      approvedBindingAdvice: 18,
      activeJobCards: 15,
      completedDeliveries: 12,
      totalRevenue: 420000,
      outstandingPayments: 115000
    },
    production: {
      totalNotebooks: 15000,
      a4Notebooks: 5000,
      a5Notebooks: 7000,
      b5Notebooks: 3000,
      averageProductionTime: 3.5,
      qualityRejectRate: 2.1
    },
    sales: {
      newClients: 8,
      repeatClients: 12,
      averageOrderValue: 17500,
      monthlyGrowth: 15.3,
      topClient: 'Government School',
      topClientValue: 75000
    }
  };

  const recentOrders = [
    { client: 'ABC School', amount: 25000, status: 'Delivered', date: '2024-01-16' },
    { client: 'XYZ College', amount: 40000, status: 'In Production', date: '2024-01-17' },
    { client: 'Government School', amount: 75000, status: 'Completed', date: '2024-01-18' },
    { client: 'Private Academy', amount: 18000, status: 'Binding Advice', date: '2024-01-19' },
  ];

  const topClients = [
    { name: 'Government School', orders: 8, value: 275000, growth: '+25%' },
    { name: 'XYZ College', orders: 6, value: 180000, growth: '+12%' },
    { name: 'ABC School', orders: 5, value: 125000, growth: '+8%' },
    { name: 'Private Academy', orders: 4, value: 95000, growth: '+18%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="last_year">Last Year</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
        <div className="flex space-x-1">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'production', label: 'Production', icon: PieChart },
            { key: 'sales', label: 'Sales', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setReportType(tab.key)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors duration-200 ${
                  reportType === tab.key
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Report */}
      {reportType === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500">Total Binding Advice</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{reportData.overview.totalBindingAdvice}</div>
              <div className="text-sm text-green-600 mt-1">+12% from last month</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500">Approved</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{reportData.overview.approvedBindingAdvice}</div>
              <div className="text-sm text-green-600 mt-1">+8% approval rate</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500">Active Jobs</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{reportData.overview.activeJobCards}</div>
              <div className="text-sm text-blue-600 mt-1">In production</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500">Deliveries</div>
              <div className="text-2xl font-bold text-orange-600 mt-1">{reportData.overview.completedDeliveries}</div>
              <div className="text-sm text-orange-600 mt-1">This month</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500">Revenue</div>
              <div className="text-2xl font-bold text-green-600 mt-1">₹{(reportData.overview.totalRevenue / 1000).toFixed(0)}K</div>
              <div className="text-sm text-green-600 mt-1">+15.3% growth</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500">Outstanding</div>
              <div className="text-2xl font-bold text-red-600 mt-1">₹{(reportData.overview.outstandingPayments / 1000).toFixed(0)}K</div>
              <div className="text-sm text-red-600 mt-1">Pending payments</div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h2>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <div>Revenue Chart</div>
                  <div className="text-sm">Integration with chart library needed</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h2>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <PieChart className="h-12 w-12 mx-auto mb-2" />
                  <div>Status Distribution</div>
                  <div className="text-sm">Integration with chart library needed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Production Report */}
      {reportType === 'production' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500">Total Notebooks</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{reportData.production.totalNotebooks.toLocaleString()}</div>
              <div className="text-sm text-green-600 mt-1">This month</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500">Avg Production Time</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{reportData.production.averageProductionTime} days</div>
              <div className="text-sm text-blue-600 mt-1">Per order</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500">Quality Rate</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{(100 - reportData.production.qualityRejectRate).toFixed(1)}%</div>
              <div className="text-sm text-green-600 mt-1">Pass rate</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Production by Notebook Size</h2>
            <div className="space-y-4">
              {[
                { size: 'A4', quantity: reportData.production.a4Notebooks, color: 'bg-blue-500' },
                { size: 'A5', quantity: reportData.production.a5Notebooks, color: 'bg-green-500' },
                { size: 'B5', quantity: reportData.production.b5Notebooks, color: 'bg-purple-500' },
              ].map((item) => {
                const percentage = (item.quantity / reportData.production.totalNotebooks) * 100;
                return (
                  <div key={item.size} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${item.color}`}></div>
                      <span className="font-medium">{item.size} Size</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-20">{item.quantity.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 w-12">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sales Report */}
      {reportType === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500">New Clients</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{reportData.sales.newClients}</div>
              <div className="text-sm text-green-600 mt-1">This month</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500">Repeat Clients</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{reportData.sales.repeatClients}</div>
              <div className="text-sm text-blue-600 mt-1">Returning</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500">Avg Order Value</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">₹{(reportData.sales.averageOrderValue / 1000).toFixed(0)}K</div>
              <div className="text-sm text-purple-600 mt-1">Per order</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-500">Growth Rate</div>
              <div className="text-2xl font-bold text-green-600 mt-1">+{reportData.sales.monthlyGrowth}%</div>
              <div className="text-sm text-green-600 mt-1">Monthly</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Clients</h2>
              <div className="space-y-3">
                {topClients.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.orders} orders</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">₹{(client.value / 1000).toFixed(0)}K</div>
                      <div className="text-sm text-green-600">{client.growth}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
              <div className="space-y-3">
                {recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{order.client}</div>
                      <div className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">₹{(order.amount / 1000).toFixed(0)}K</div>
                      <div className={`text-sm px-2 py-1 rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'In Production' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Completed' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;