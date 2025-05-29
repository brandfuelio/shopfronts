"use client"

import { useState } from "react"

import {
  BarChart3,
  Package,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Search,
  TrendingUp,
  DollarSign,
  Star,
} from "your-icon-library" // Import the icons here

// Sellers Management Page Component (Admin Only)
const SellersPage = ({ currentUser, handleLogout, setCurrentPage }: any) => {
  const [sellers] = useState([
    {
      id: 1,
      name: "AudioTech Studios",
      email: "contact@audiotech.com",
      joinDate: "March 2023",
      products: 12,
      totalSales: 15420,
      revenue: 1542000,
      commission: 154200,
      status: "active",
      rating: 4.8,
      avatar: "/placeholder.svg?height=40&width=40&query=audiotech+logo",
    },
    {
      id: 2,
      name: "BeatCraft Inc",
      email: "hello@beatcraft.com",
      joinDate: "June 2023",
      products: 8,
      totalSales: 8920,
      revenue: 624080,
      commission: 62408,
      status: "active",
      rating: 4.6,
      avatar: "/placeholder.svg?height=40&width=40&query=beatcraft+logo",
    },
    {
      id: 3,
      name: "PublishPro",
      email: "support@publishpro.com",
      joinDate: "January 2023",
      products: 15,
      totalSales: 6340,
      revenue: 316936,
      commission: 31694,
      status: "active",
      rating: 4.7,
      avatar: "/placeholder.svg?height=40&width=40&query=publishpro+logo",
    },
    {
      id: 4,
      name: "ArtFlow Studios",
      email: "info@artflow.com",
      joinDate: "August 2023",
      products: 6,
      totalSales: 7560,
      revenue: 453524,
      commission: 45352,
      status: "pending",
      rating: 4.5,
      avatar: "/placeholder.svg?height=40&width=40&query=artflow+logo",
    },
    {
      id: 5,
      name: "VideoTech Pro",
      email: "team@videotech.com",
      joinDate: "February 2023",
      products: 4,
      totalSales: 21560,
      revenue: 2802744,
      commission: 280274,
      status: "active",
      rating: 4.9,
      avatar: "/placeholder.svg?height=40&width=40&query=videotech+logo",
    },
  ])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">DigitalStore</h1>
              <p className="text-xs text-gray-500">Sellers</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentPage("products")}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Package className="w-5 h-5" />
              <span>All Products</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors bg-gray-100">
              <Users className="w-5 h-5" />
              <span>Manage Sellers</span>
            </button>
            <button
              onClick={() => setCurrentPage("sales")}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              <span>Platform Revenue</span>
            </button>
            <button
              onClick={() => setCurrentPage("customers")}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>All Customers</span>
            </button>
            <button
              onClick={() => setCurrentPage("settings")}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Platform Settings</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Sellers</h1>
              <p className="text-gray-600">Review and manage all sellers on the platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  placeholder="Search sellers..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-3">
                <img src={currentUser?.avatar || "/placeholder.svg"} alt="Avatar" className="w-8 h-8 rounded-full" />
                <div>
                  <p className="font-medium text-gray-900">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Sellers Content */}
        <main className="flex-1 p-6">
          {/* Seller Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Sellers</p>
                  <p className="text-2xl font-bold text-gray-900">{sellers.length}</p>
                  <p className="text-green-600 text-sm">+3 this month</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Sellers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sellers.filter((s) => s.status === "active").length}
                  </p>
                  <p className="text-green-600 text-sm">94% active rate</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Commission</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${sellers.reduce((sum, s) => sum + s.commission, 0).toLocaleString()}
                  </p>
                  <p className="text-green-600 text-sm">+12.5% this month</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(sellers.reduce((sum, s) => sum + s.rating, 0) / sellers.length).toFixed(1)}
                  </p>
                  <p className="text-green-600 text-sm">Excellent quality</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Sellers Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">All Sellers</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    Export
                  </button>
                  <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Invite Seller
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={seller.avatar || "/placeholder.svg"}
                            alt={seller.name}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{seller.name}</div>
                            <div className="text-sm text-gray-500">{seller.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{seller.products}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {seller.totalSales.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${seller.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${seller.commission.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-900">{seller.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            seller.status === "active"
                              ? "bg-green-100 text-green-800"
                              : seller.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {seller.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">View</button>
                          <button className="text-gray-600 hover:text-gray-900">Edit</button>
                          {seller.status === "pending" && (
                            <button className="text-green-600 hover:text-green-900">Approve</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
