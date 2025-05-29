"use client"

import { useState } from "react"
import {
  Package,
  Plus,
  BarChart3,
  DollarSign,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Search,
  ArrowLeft,
  Star,
} from "lucide-react"

import ProductFormModal from "./product-form-modal"
import AnalyticsDashboard from "./analytics-dashboard"

interface SellerDashboardProps {
  currentUser: any
  setCurrentPage: (page: string) => void
  products: any[]
  orders: any[]
}

export default function SellerDashboard({
  currentUser,
  setCurrentPage,
  products: initialProducts,
  orders,
}: SellerDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const sellerProducts = initialProducts.filter((product) => product.developer === currentUser?.name)

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "products", label: "My Products", icon: Package },
    { id: "orders", label: "Orders", icon: Users },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ]

  // Mock seller products (filter by seller)
  const sellerOrders = orders.filter((order) => sellerProducts.some((product) => product.name === order.productName))

  const totalRevenue = sellerOrders.reduce((sum, order) => sum + order.amount, 0)
  const totalSales = sellerOrders.length
  const averageRating = sellerProducts.reduce((sum, product) => sum + product.rating, 0) / sellerProducts.length || 0

  const filteredProducts = sellerProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || product.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowProductForm(true)
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setShowProductForm(true)
  }

  const handleSaveProduct = (productData: any) => {
    if (editingProduct) {
      setEditingProduct(productData)
    } else {
      // Assuming there's a way to update the initial products list, e.g., through a callback from ProductFormModal
      // For simplicity, this example doesn't handle that part
    }
  }

  const handleDeleteProduct = (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      // Assuming there's a way to update the initial products list, e.g., through a callback from ProductFormModal
      // For simplicity, this example doesn't handle that part
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage("home")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Seller Dashboard</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
              <img src={currentUser?.avatar || "/placeholder.svg"} alt="Profile" className="w-8 h-8 rounded-full" />
              <span className="text-sm font-medium text-gray-900">{currentUser?.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <img
                    src={currentUser?.avatar || "/placeholder.svg"}
                    alt="Profile"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{currentUser?.name}</h3>
                    <p className="text-sm text-gray-500">Seller since {currentUser?.joinDate}</p>
                  </div>
                </div>
              </div>

              <nav className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Products</span>
                  <span className="font-medium text-gray-900">{sellerProducts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Sales</span>
                  <span className="font-medium text-gray-900">{totalSales}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="font-medium text-gray-900">${totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Rating</span>
                  <span className="font-medium text-gray-900">{averageRating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Dashboard Overview</h2>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">Total Revenue</p>
                          <p className="text-2xl font-bold text-blue-900">${totalRevenue.toFixed(2)}</p>
                          <p className="text-blue-600 text-sm">+12.5% this month</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">Total Sales</p>
                          <p className="text-2xl font-bold text-green-900">{totalSales}</p>
                          <p className="text-green-600 text-sm">+8.2% this month</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-sm font-medium">Products</p>
                          <p className="text-2xl font-bold text-purple-900">{sellerProducts.length}</p>
                          <p className="text-purple-600 text-sm">
                            {sellerProducts.filter((p) => p.status === "active").length} active
                          </p>
                        </div>
                        <Package className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-600 text-sm font-medium">Avg Rating</p>
                          <p className="text-2xl font-bold text-yellow-900">{averageRating.toFixed(1)}</p>
                          <p className="text-yellow-600 text-sm">Excellent quality</p>
                        </div>
                        <Star className="w-8 h-8 text-yellow-600" />
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                    <div className="space-y-3">
                      {sellerOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{order.productName}</p>
                            <p className="text-sm text-gray-500">
                              Order #{order.id} • {order.customerName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${order.amount}</p>
                            <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Products */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sellerProducts.slice(0, 3).map((product) => (
                        <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{product.name}</h4>
                          <div className="flex items-center space-x-2 mb-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-600">{product.rating}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-900">${product.price}</span>
                            <span className="text-sm text-gray-500">{product.downloads} downloads</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === "products" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">My Products</h2>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                      <button
                        onClick={handleAddProduct}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Product</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                              <img
                                src={product.mainImage || `/placeholder.svg?height=64&width=64&query=${product.name}`}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{product.name}</h3>
                              <p className="text-sm text-gray-500">{product.category}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(product.status)}`}
                                >
                                  {product.status}
                                </span>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs text-gray-600">{product.rating}</span>
                                </div>
                                <span className="text-xs text-gray-600">{product.downloads} downloads</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-semibold text-gray-900">${product.price}</span>
                            <div className="flex space-x-2">
                              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredProducts.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500 mb-4">
                          {searchQuery || filterStatus !== "all"
                            ? "Try adjusting your search or filter criteria"
                            : "Start by adding your first product"}
                        </p>
                        <button
                          onClick={handleAddProduct}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add Your First Product
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Order Management</h2>
                    <span className="text-sm text-gray-500">{sellerOrders.length} total orders</span>
                  </div>

                  <div className="space-y-4">
                    {sellerOrders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{order.productName}</h3>
                            <p className="text-sm text-gray-500">
                              Order #{order.id} • {order.customerName} • {order.customerEmail}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.date).toLocaleDateString()} • {order.paymentMethod}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-gray-900">${order.amount}</span>
                            <div className="mt-2">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}
                              >
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {sellerOrders.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500">Orders for your products will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === "analytics" && (
                <div className="p-6">
                  <AnalyticsDashboard
                    orders={sellerOrders}
                    products={initialProducts}
                    users={[]}
                    userRole="seller"
                    currentUser={currentUser}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={showProductForm}
        onClose={() => setShowProductForm(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        mode={editingProduct ? "edit" : "create"}
      />
    </div>
  )
}
