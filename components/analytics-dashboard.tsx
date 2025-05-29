"use client"

import { useState } from "react"
import { BarChart3, DollarSign, Users, Package, Download, Calendar, Filter } from "lucide-react"

interface AnalyticsDashboardProps {
  orders: any[]
  products: any[]
  users: any[]
  userRole: "admin" | "seller"
  currentUser?: any
}

export default function AnalyticsDashboard({
  orders,
  products,
  users,
  userRole,
  currentUser,
}: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("revenue")

  // Filter data based on user role
  const filteredOrders =
    userRole === "seller"
      ? orders.filter((order) =>
          products.some((product) => product.name === order.productName && product.developer === currentUser?.name),
        )
      : orders

  const filteredProducts =
    userRole === "seller" ? products.filter((product) => product.developer === currentUser?.name) : products

  // Calculate metrics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.amount, 0)
  const totalOrders = filteredOrders.length
  const totalProducts = filteredProducts.length
  const totalUsers = users.length

  // Mock chart data
  const chartData = {
    revenue: [
      { period: "Week 1", value: 2400 },
      { period: "Week 2", value: 1398 },
      { period: "Week 3", value: 9800 },
      { period: "Week 4", value: 3908 },
    ],
    orders: [
      { period: "Week 1", value: 24 },
      { period: "Week 2", value: 13 },
      { period: "Week 3", value: 98 },
      { period: "Week 4", value: 39 },
    ],
    users: [
      { period: "Week 1", value: 12 },
      { period: "Week 2", value: 8 },
      { period: "Week 3", value: 15 },
      { period: "Week 4", value: 22 },
    ],
  }

  const currentData = chartData[selectedMetric as keyof typeof chartData] || chartData.revenue

  const metrics = [
    {
      id: "revenue",
      label: "Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      change: "+12.5%",
      changeType: "positive",
      icon: DollarSign,
      color: "blue",
    },
    {
      id: "orders",
      label: "Orders",
      value: totalOrders.toString(),
      change: "+8.2%",
      changeType: "positive",
      icon: Package,
      color: "green",
    },
    ...(userRole === "admin"
      ? [
          {
            id: "users",
            label: "Users",
            value: totalUsers.toString(),
            change: "+15.3%",
            changeType: "positive",
            icon: Users,
            color: "purple",
          },
        ]
      : []),
    {
      id: "products",
      label: "Products",
      value: totalProducts.toString(),
      change: "+5.1%",
      changeType: "positive",
      icon: BarChart3,
      color: "orange",
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-50 to-blue-100 text-blue-600 bg-blue-600",
      green: "from-green-50 to-green-100 text-green-600 bg-green-600",
      purple: "from-purple-50 to-purple-100 text-purple-600 bg-purple-600",
      orange: "from-orange-50 to-orange-100 text-orange-600 bg-orange-600",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const colorClasses = getColorClasses(metric.color)

          return (
            <div
              key={metric.id}
              className={`bg-gradient-to-r ${colorClasses.split(" ").slice(0, 2).join(" ")} rounded-lg p-6 cursor-pointer transition-transform hover:scale-105`}
              onClick={() => setSelectedMetric(metric.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${colorClasses.split(" ")[2]} text-sm font-medium`}>{metric.label}</p>
                  <p
                    className={`text-2xl font-bold ${colorClasses.split(" ")[2].replace("text-", "text-").replace("-600", "-900")}`}
                  >
                    {metric.value}
                  </p>
                  <p className={`${colorClasses.split(" ")[2]} text-sm`}>{metric.change} this month</p>
                </div>
                <Icon className={`w-8 h-8 ${colorClasses.split(" ")[2]}`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 capitalize">{selectedMetric} Trend</h3>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Last 4 weeks</span>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="space-y-4">
          {currentData.map((item, index) => {
            const maxValue = Math.max(...currentData.map((d) => d.value))
            const percentage = (item.value / maxValue) * 100

            return (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-gray-600">{item.period}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                  <div
                    className="bg-blue-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="text-white text-sm font-medium">
                      {selectedMetric === "revenue" ? `$${item.value}` : item.value}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
          <div className="space-y-4">
            {filteredProducts.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${product.price}</p>
                  <p className="text-sm text-gray-500">{product.downloads} downloads</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {filteredOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{order.customerName}</span> purchased{" "}
                    <span className="font-medium">{order.productName}</span>
                  </p>
                  <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-medium text-gray-900">${order.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  )
}
