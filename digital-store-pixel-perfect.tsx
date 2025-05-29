"use client"

import { useState, useEffect } from "react"
import {
  Search,
  ShoppingCart,
  Heart,
  Download,
  Star,
  Sparkles,
  Send,
  Paperclip,
  Smile,
  Mic,
  X,
  Command,
  Filter,
  Plus,
  Minus,
  ShoppingBag,
  User,
  Store,
  Shield,
} from "lucide-react"
import CustomerDashboard from "./components/customer-dashboard"
import SellerDashboard from "./components/seller-dashboard"
import AdminDashboard from "./components/admin-dashboard"
import CheckoutFlow from "./components/checkout-flow"
import LoginPage from "./components/login-page"
import RegisterPage from "./components/register-page"

interface Product {
  id: number
  name: string
  price: number
  originalPrice: number
  rating: number
  discount: string
  category: string
  description: string
  features: string[]
  screenshots: string[]
  reviews: number
  downloads: string
  lastUpdated: string
  developer: string
  status: "active" | "draft" | "archived"
  sales: number
  revenue: number
  mainImage?: string
}

interface Review {
  id: number
  productId: number
  userId: number
  userName: string
  userAvatar: string
  rating: number
  title: string
  comment: string
  date: string
  verified: boolean
  helpful: number
  reported: number
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: { [key: number]: number }
}

interface CartItem {
  id: number
  product: Product
  quantity: number
}

interface UserType {
  id: number
  name: string
  email: string
  avatar: string
  joinDate: string
  totalPurchases: number
  totalSpent: number
  role: "admin" | "seller" | "customer"
}

type Page =
  | "login"
  | "register"
  | "email-verification"
  | "forgot-password"
  | "reset-password"
  | "profile"
  | "dashboard"
  | "products"
  | "home"
  | "sales"
  | "customers"
  | "settings"
  | "sellers"
  | "customer-dashboard"
  | "seller-dashboard"
  | "admin-dashboard"

// Shopping Cart Modal Component
const ShoppingCartModal = ({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  removeFromCart,
  onCheckout,
}: {
  isOpen: boolean
  onClose: () => void
  cartItems: CartItem[]
  updateQuantity: (productId: number, quantity: number) => void
  removeFromCart: (productId: number) => void
  onCheckout?: () => void
}) => {
  if (!isOpen) return null

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-0.5">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-1 h-2 bg-white rounded-full" />
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">{item.product.category}</p>
                    <p className="font-bold text-gray-900">${item.product.price}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 hover:bg-red-100 rounded text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Filters Modal Component
const FiltersModal = ({
  isOpen,
  onClose,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
}: {
  isOpen: boolean
  onClose: () => void
  priceRange: { min: number; max: number }
  setPriceRange: (range: { min: number; max: number }) => void
  sortBy: string
  setSortBy: (sort: string) => void
}) => {
  if (!isOpen) return null

  const handleApplyFilters = () => {
    onClose()
  }

  const handleResetFilters = () => {
    setPriceRange({ min: 0, max: 500 })
    setSortBy("name")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-6 space-y-6">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Min"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="rating">Rating (High to Low)</option>
            </select>
          </div>

          {/* Quick Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Quick Filters</label>
            <div className="space-y-2">
              <button
                onClick={() => setPriceRange({ min: 0, max: 50 })}
                className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Under $50
              </button>
              <button
                onClick={() => setPriceRange({ min: 50, max: 100 })}
                className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                $50 - $100
              </button>
              <button
                onClick={() => setPriceRange({ min: 100, max: 500 })}
                className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Over $100
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex space-x-3">
          <button
            onClick={handleResetFilters}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

// Home Page Component with integrated functionality
const HomePage = ({
  products,
  chatMessage,
  setChatMessage,
  isAuthenticated,
  currentUser,
  setCurrentPage,
  currentPage,
  setCurrentUser,
  setIsAuthenticated,
}: any) => {
  const [searchQuery, setSearchQuery] = useState("Digital music software")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showCart, setShowCart] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 })
  const [sortBy, setSortBy] = useState("name")
  const [filteredProducts, setFilteredProducts] = useState(products || [])

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseProduct, setPurchaseProduct] = useState<Product | null>(null)

  const [wishlistItems, setWishlistItems] = useState<Product[]>([])

  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      joinDate: "Jan 2024",
      totalPurchases: 5,
      totalSpent: 299.95,
      status: "active",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      joinDate: "Feb 2024",
      totalPurchases: 3,
      totalSpent: 189.97,
      status: "active",
    },
    {
      id: 3,
      name: "Mike Wilson",
      email: "mike.w@email.com",
      joinDate: "Mar 2024",
      totalPurchases: 8,
      totalSpent: 567.92,
      status: "active",
    },
  ])

  const addCustomer = (customerData: any) => {
    const newCustomer = {
      id: customers.length + 1,
      ...customerData,
      joinDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      totalPurchases: 0,
      totalSpent: 0,
      status: "active",
    }
    setCustomers([...customers, newCustomer])
    setShowAddCustomer(false)
  }

  const [showAddSeller, setShowAddSeller] = useState(false)
  const [sellers, setSellers] = useState([
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
    },
  ])

  const addSeller = (sellerData: any) => {
    const newSeller = {
      id: sellers.length + 1,
      ...sellerData,
      joinDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      products: 0,
      totalSales: 0,
      revenue: 0,
      commission: 0,
      status: "pending",
      rating: 0,
    }
    setSellers([...sellers, newSeller])
    setShowAddSeller(false)
  }

  const [orders, setOrders] = useState([
    {
      id: "ORD-001",
      customerName: "John Smith",
      customerEmail: "john.smith@email.com",
      productName: "Audio Studio Pro",
      amount: 89.99,
      status: "completed",
      date: "2024-01-15",
      paymentMethod: "Credit Card",
    },
    {
      id: "ORD-002",
      customerName: "Sarah Johnson",
      customerEmail: "sarah.j@email.com",
      productName: "Beat Maker 2023",
      amount: 69.99,
      status: "completed",
      date: "2024-01-14",
      paymentMethod: "PayPal",
    },
    {
      id: "ORD-003",
      customerName: "Mike Wilson",
      customerEmail: "mike.w@email.com",
      productName: "E-Book Creator Plus",
      amount: 49.99,
      status: "pending",
      date: "2024-01-13",
      paymentMethod: "Credit Card",
    },
  ])

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => `"${row[header]}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      productId: 1,
      userId: 1,
      userName: "Sarah M.",
      userAvatar: "/placeholder.svg?height=32&width=32&query=user+avatar+1",
      rating: 5,
      title: "Excellent software!",
      comment: "Easy to use and very powerful. Has everything I need for music production.",
      date: "2024-01-15",
      verified: true,
      helpful: 12,
      reported: 0,
    },
    {
      id: 2,
      productId: 1,
      userId: 2,
      userName: "Mike R.",
      userAvatar: "/placeholder.svg?height=32&width=32&query=user+avatar+2",
      rating: 5,
      title: "Best investment for my setup",
      comment: "This software has completely transformed my music production workflow. Highly recommended!",
      date: "2024-01-10",
      verified: true,
      helpful: 8,
      reported: 0,
    },
    {
      id: 3,
      productId: 1,
      userId: 3,
      userName: "Lisa K.",
      userAvatar: "/placeholder.svg?height=32&width=32&query=user+avatar+3",
      rating: 4,
      title: "Great features",
      comment: "Really good software with lots of features. Would definitely recommend to others.",
      date: "2024-01-05",
      verified: false,
      helpful: 5,
      reported: 0,
    },
    {
      id: 4,
      productId: 2,
      userId: 4,
      userName: "Alex T.",
      userAvatar: "/placeholder.svg?height=32&width=32&query=user+avatar+4",
      rating: 5,
      title: "Perfect for beat making",
      comment: "Intuitive interface and great sound library. Everything you need to create professional beats.",
      date: "2024-01-12",
      verified: true,
      helpful: 15,
      reported: 0,
    },
  ])

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null)
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    comment: "",
  })

  // Filter and search logic
  useEffect(() => {
    if (!products) return

    let filtered = [...products]

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Price range filter
    filtered = filtered.filter((product) => product.price >= priceRange.min && product.price <= priceRange.max)

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory, priceRange, sortBy])

  const categories = [
    { name: "All", icon: "" },
    { name: "Software", icon: "💻" },
    { name: "Music & Audio", icon: "🎵" },
    { name: "E-books", icon: "📚" },
    { name: "Graphics & Design", icon: "🎨" },
    { name: "Games", icon: "🎮" },
  ]

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id)
      if (existingItem) {
        return prev.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { id: Date.now(), product, quantity: 1 }]
    })
  }

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems((prev) => prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item)))
  }

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const addToWishlist = (product: Product) => {
    setWishlistItems((prev) => {
      if (prev.find((item) => item.id === product.id)) {
        return prev.filter((item) => item.id !== product.id)
      }
      return [...prev, product]
    })
  }

  const isInWishlist = (productId: number) => {
    return wishlistItems.some((item) => item.id === productId)
  }

  const handleBuyNow = (product: Product) => {
    setPurchaseProduct(product)
    setShowPurchaseModal(true)
  }

  const handlePurchaseComplete = () => {
    setShowPurchaseModal(false)
    setPurchaseProduct(null)
    // Here you would typically integrate with payment processing
    alert(`Purchase completed for ${purchaseProduct?.name}!`)
  }

  const handleDiscoverNew = () => {
    const randomCategories = categories.filter((cat) => cat.name !== "All")
    const randomCategory = randomCategories[Math.floor(Math.random() * randomCategories.length)]
    setSelectedCategory(randomCategory.name)
    setSearchQuery("")
  }

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    siteName: "DigitalStore",
    siteDescription: "Digital Downloads Marketplace",
    currency: "USD",
    commissionRate: 10,
    emailNotifications: true,
    orderNotifications: true,
    marketingEmails: false,
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
  })

  const [userSettings, setUserSettings] = useState({
    name: "John Admin",
    email: "admin@digitalstore.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    orderAlerts: true,
    weeklyReports: false,
  })

  const saveSettings = () => {
    // Simulate API call
    setTimeout(() => {
      alert("Settings saved successfully!")
    }, 500)
  }

  const updatePassword = () => {
    if (userSettings.newPassword !== userSettings.confirmPassword) {
      alert("New passwords don't match!")
      return
    }
    if (userSettings.newPassword.length < 8) {
      alert("Password must be at least 8 characters long!")
      return
    }
    // Simulate API call
    setTimeout(() => {
      alert("Password updated successfully!")
      setUserSettings({
        ...userSettings,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }, 500)
  }

  const getProductReviews = (productId: number) => {
    return reviews.filter((review) => review.productId === productId)
  }

  const getReviewStats = (productId: number): ReviewStats => {
    const productReviews = getProductReviews(productId)
    const totalReviews = productReviews.length
    const averageRating =
      totalReviews > 0 ? productReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    productReviews.forEach((review) => {
      ratingDistribution[review.rating]++
    })

    return { totalReviews, averageRating, ratingDistribution }
  }

  const handleSubmitReview = () => {
    if (!reviewProduct || !isAuthenticated) return

    const review: Review = {
      id: Date.now(),
      productId: reviewProduct.id,
      userId: currentUser?.id || 0,
      userName: currentUser?.name || "Anonymous",
      userAvatar: currentUser?.avatar || "/placeholder.svg?height=32&width=32&query=user+avatar",
      rating: newReview.rating,
      title: newReview.title,
      comment: newReview.comment,
      date: new Date().toISOString().split("T")[0],
      verified: true,
      helpful: 0,
      reported: 0,
    }

    setReviews([review, ...reviews])
    setShowReviewModal(false)
    setNewReview({ rating: 5, title: "", comment: "" })
    setReviewProduct(null)
  }

  const handleHelpfulReview = (reviewId: number) => {
    setReviews(reviews.map((review) => (review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review)))
  }

  const openReviewModal = (product: Product) => {
    setReviewProduct(product)
    setShowReviewModal(true)
  }

  const [showCheckout, setShowCheckout] = useState(false)

  // Add dashboard routing logic
  if (currentPage === "customer-dashboard") {
    return (
      <CustomerDashboard
        currentUser={currentUser}
        setCurrentPage={setCurrentPage}
        orders={orders}
        wishlistItems={wishlistItems}
      />
    )
  }

  if (currentPage === "seller-dashboard") {
    return (
      <SellerDashboard currentUser={currentUser} setCurrentPage={setCurrentPage} products={products} orders={orders} />
    )
  }

  if (currentPage === "admin-dashboard") {
    return (
      <AdminDashboard
        currentUser={currentUser}
        setCurrentPage={setCurrentPage}
        users={[...customers, ...sellers, currentUser].filter(Boolean)}
        products={products}
        orders={orders}
      />
    )
  }

  // Page routing
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans relative">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 backdrop-blur-sm bg-white/95 flex items-center h-[68px]">
          <div className="flex items-center justify-between w-full">
            {/* Left side - Logo and badge */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-base">D</span>
                </div>
                <div>
                  <h1 className="font-bold text-base text-gray-900 leading-tight">DigitalStore</h1>
                  <p className="text-xs text-gray-500 leading-tight -mt-0.5">Digital Downloads</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white text-xs px-2 py-0.5 rounded font-medium shadow-sm">
                v0 block
              </div>
            </div>

            {/* Center - Search bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative group">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 shadow-sm"
                  placeholder="Search for digital products..."
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                    <Mic className="w-4 h-4 text-gray-400" />
                  </button>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
                    <Command className="w-3 h-3" />
                    <span>K</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Cart and Login */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCart(true)}
                className="px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors relative group"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {totalCartItems > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{totalCartItems}</span>
                  </div>
                )}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (currentUser?.role === "admin") {
                        setCurrentPage("admin-dashboard")
                      } else if (currentUser?.role === "seller") {
                        setCurrentPage("seller-dashboard")
                      } else {
                        setCurrentPage("customer-dashboard")
                      }
                    }}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all duration-200"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentPage("profile")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <img
                      src={currentUser?.avatar || "/placeholder.svg"}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCurrentPage("login")}
                  className="px-6 py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all duration-200 hover:shadow-sm"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="sticky top-[68px] z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-center space-x-3 px-6 h-[68px]">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2.5 text-sm rounded-full font-medium transition-all duration-200 flex items-center space-x-1 ${
                  selectedCategory === category.name
                    ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md hover:border-gray-400"
                }`}
              >
                {category.icon && <span>{category.icon}</span>}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Filters and Actions */}
        <div className="px-6 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all duration-200 hover:shadow-md hover:border-gray-400"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button
              onClick={handleDiscoverNew}
              className="flex items-center px-3 py-1.5 text-sm text-purple-600 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-purple-150 font-medium transition-all duration-200 hover:shadow-md"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Discover Something New
            </button>
          </div>
        </div>

        {/* Results */}
        <main className="flex-1 px-6 py-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {searchQuery ? `Results for "${searchQuery}"` : `${selectedCategory} Products`}
            </h2>
            <p className="text-gray-600 text-sm">{filteredProducts.length} products found</p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {filteredProducts.slice(0, 3).map((product: Product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
              >
                <div className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 h-48">
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-md font-semibold shadow-lg">
                    {product.discount}
                  </div>
                  <div className="flex items-center justify-center h-full">
                    <div className="w-24 h-16 bg-gray-900 rounded-lg relative shadow-xl group-hover:scale-105 transition-transform duration-300">
                      <div className="absolute top-1 left-1 right-1 flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        <div
                          className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                      <div className="mt-3 px-2 py-1">
                        <div className="grid grid-cols-12 gap-0.5 h-6 items-end">
                          {[4, 6, 3, 5, 4, 6, 3, 5, 4, 6, 3, 5, 4, 6, 3, 5, 4, 6, 3, 5, 4, 6, 3, 5].map((height, i) => (
                            <div
                              key={i}
                              className={`w-full rounded-full transition-all duration-300 ${
                                i % 4 === 0
                                  ? "bg-blue-400 group-hover:bg-blue-300"
                                  : i % 4 === 1
                                    ? "bg-green-400 group-hover:bg-green-300"
                                    : i % 4 === 2
                                      ? "bg-purple-400 group-hover:bg-purple-300"
                                      : "bg-cyan-400 group-hover:bg-cyan-300"
                              }`}
                              style={{ height: `${height * 2}px` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-base">{product.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addToWishlist(product)
                      }}
                      className={`p-1 hover:bg-red-50 rounded transition-colors group ${
                        isInWishlist(product.id) ? "bg-red-50" : ""
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isInWishlist(product.id)
                            ? "text-red-500 fill-red-500"
                            : "text-gray-400 group-hover:text-red-500"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center space-x-1 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {getReviewStats(product.id).averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">({getReviewStats(product.id).totalReviews})</span>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Download className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Instant Download</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-lg font-bold text-gray-900">${product.price}</span>
                      <span className="text-sm text-gray-500">USD</span>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-600 border border-purple-200 px-2 py-1 rounded-lg text-xs font-medium">
                      💻 {product.category}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBuyNow(product)
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-medium text-sm flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Buy Now
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addToCart(product)
                      }}
                      className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-medium text-sm flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </button>
                  </div>
                  {isAuthenticated && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openReviewModal(product)
                      }}
                      className="w-full mt-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg font-medium text-sm flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Write Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Digital Art Studio - Bottom row */}
          <div className="grid grid-cols-3 gap-4">
            {filteredProducts.slice(3, 4).map((product: Product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
              >
                <div className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 h-48">
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-md font-semibold shadow-lg">
                    {product.discount}
                  </div>
                  <div className="flex items-center justify-center h-full">
                    <div className="w-24 h-16 bg-gray-900 rounded-lg relative shadow-xl group-hover:scale-105 transition-transform duration-300">
                      <div className="absolute top-1 left-1 right-1 flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                        <div
                          className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                      <div className="mt-3 px-2 py-1">
                        <div className="grid grid-cols-12 gap-0.5 h-6 items-end">
                          {[6, 3, 5, 4, 6, 3, 5, 4, 6, 3, 5, 4, 6, 3, 5, 4, 6, 3, 5, 4, 6, 3, 5, 4].map((height, i) => (
                            <div
                              key={i}
                              className={`w-full rounded-full transition-all duration-300 ${
                                i % 4 === 0
                                  ? "bg-blue-400 group-hover:bg-blue-300"
                                  : i % 4 === 1
                                    ? "bg-green-400 group-hover:bg-green-300"
                                    : i % 4 === 2
                                      ? "bg-purple-400 group-hover:bg-purple-300"
                                      : "bg-cyan-400 group-hover:bg-cyan-300"
                              }`}
                              style={{ height: `${height * 2}px` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-base">{product.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addToWishlist(product)
                      }}
                      className={`p-1 hover:bg-red-50 rounded transition-colors group ${
                        isInWishlist(product.id) ? "bg-red-50" : ""
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isInWishlist(product.id)
                            ? "text-red-500 fill-red-500"
                            : "text-gray-400 group-hover:text-red-500"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center space-x-1 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {getReviewStats(product.id).averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">({getReviewStats(product.id).totalReviews})</span>
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <Download className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Instant Download</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-lg font-bold text-gray-900">${product.price}</span>
                      <span className="text-sm text-gray-500">USD</span>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-600 border border-purple-200 px-2 py-1 rounded-lg text-xs font-medium">
                      💻 {product.category}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleBuyNow(product)
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-medium text-sm flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Buy Now
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addToCart(product)
                      }}
                      className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-medium text-sm flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </button>
                  </div>
                  {isAuthenticated && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openReviewModal(product)
                      }}
                      className="w-full mt-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg font-medium text-sm flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Write Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* AI Assistant Chat */}
      {/* Enhanced AI Assistant Chat */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl sticky top-0 h-screen">
        {/* Chat Header */}
        <div className="border-b border-gray-200 bg-white flex items-center px-4 h-[68px]">
          <div className="flex items-center space-x-3 w-full">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white text-base">🤖</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 leading-tight">ShopSmart Assistant</h3>
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                <p className="text-xs text-gray-500 leading-tight">Ready to help with your shopping</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome Message */}
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs">🤖</span>
                </div>
              </div>
              <div className="rounded-2xl p-3 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 shadow-sm">
                <p className="text-sm">
                  👋 <span className="font-medium">Welcome to DigitalStore!</span> I'm your AI shopping assistant. I can
                  help you:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className="px-2 py-1 bg-white rounded-full text-xs text-blue-600 border border-blue-100 hover:bg-blue-50 transition-colors">
                    Find products
                  </button>
                  <button className="px-2 py-1 bg-white rounded-full text-xs text-blue-600 border border-blue-100 hover:bg-blue-50 transition-colors">
                    Compare options
                  </button>
                  <button className="px-2 py-1 bg-white rounded-full text-xs text-blue-600 border border-blue-100 hover:bg-blue-50 transition-colors">
                    Get recommendations
                  </button>
                  <button className="px-2 py-1 bg-white rounded-full text-xs text-blue-600 border border-blue-100 hover:bg-blue-50 transition-colors">
                    Check deals
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 px-2">2:30 PM</p>
            </div>
          </div>

          {/* User Message */}
          <div className="flex justify-end">
            <div className="max-w-[85%]">
              <div className="rounded-2xl p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
                <p className="text-sm">I need music production software</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 px-2 text-right">03:21 PM ✓</p>
            </div>
          </div>

          {/* Assistant Message with Product Carousel */}
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs">🤖</span>
                </div>
              </div>
              <div className="rounded-2xl p-3 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 shadow-sm">
                <p className="text-sm">
                  🎵 Great choice! I found some excellent music production software options. Here are the top picks:
                </p>

                {/* Product Carousel */}
                <div className="mt-3 overflow-x-auto pb-2 -mx-3 px-3">
                  <div className="flex space-x-3">
                    {/* Product Card 1 */}
                    <div className="w-48 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                      <div className="h-24 bg-gradient-to-br from-purple-600 to-purple-700 p-2 flex items-center justify-center">
                        <div className="w-16 h-12 bg-gray-900 rounded-lg relative shadow-xl">
                          <div className="absolute top-1 left-1 right-1 flex space-x-1">
                            <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                            <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          </div>
                          <div className="mt-3 px-1">
                            <div className="grid grid-cols-8 gap-0.5 h-4 items-end">
                              {[3, 5, 2, 4, 3, 5, 2, 4].map((height, i) => (
                                <div
                                  key={i}
                                  className="w-full bg-blue-400 rounded-full"
                                  style={{ height: `${height}px` }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm text-gray-900 truncate">Audio Studio Pro</h4>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">4.8 (235)</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-baseline space-x-1">
                            <span className="font-bold text-sm text-gray-900">$89.99</span>
                            <span className="text-xs text-gray-500 line-through">$119.99</span>
                          </div>
                          <span className="text-xs font-medium text-green-600">-25%</span>
                        </div>
                        <button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded-lg transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>

                    {/* Product Card 2 */}
                    <div className="w-48 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                      <div className="h-24 bg-gradient-to-br from-blue-600 to-blue-700 p-2 flex items-center justify-center">
                        <div className="w-16 h-12 bg-gray-900 rounded-lg relative shadow-xl">
                          <div className="absolute top-1 left-1 right-1 flex space-x-1">
                            <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                            <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          </div>
                          <div className="mt-3 px-1">
                            <div className="grid grid-cols-8 gap-0.5 h-4 items-end">
                              {[4, 2, 5, 3, 4, 2, 5, 3].map((height, i) => (
                                <div
                                  key={i}
                                  className="w-full bg-green-400 rounded-full"
                                  style={{ height: `${height}px` }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm text-gray-900 truncate">Beat Maker 2023</h4>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">4.6 (187)</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-baseline space-x-1">
                            <span className="font-bold text-sm text-gray-900">$69.99</span>
                            <span className="text-xs text-gray-500 line-through">$89.99</span>
                          </div>
                          <span className="text-xs font-medium text-green-600">-22%</span>
                        </div>
                        <button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded-lg transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>

                    {/* Product Card 3 */}
                    <div className="w-48 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                      <div className="h-24 bg-gradient-to-br from-purple-500 to-indigo-600 p-2 flex items-center justify-center">
                        <div className="w-16 h-12 bg-gray-900 rounded-lg relative shadow-xl">
                          <div className="absolute top-1 left-1 right-1 flex space-x-1">
                            <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                            <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          </div>
                          <div className="mt-3 px-1">
                            <div className="grid grid-cols-8 gap-0.5 h-4 items-end">
                              {[5, 3, 4, 2, 5, 3, 4, 2].map((height, i) => (
                                <div
                                  key={i}
                                  className="w-full bg-purple-400 rounded-full"
                                  style={{ height: `${height}px` }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm text-gray-900 truncate">Pro Mixer Studio</h4>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">4.7 (156)</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-baseline space-x-1">
                            <span className="font-bold text-sm text-gray-900">$79.99</span>
                            <span className="text-xs text-gray-500 line-through">$99.99</span>
                          </div>
                          <span className="text-xs font-medium text-green-600">-20%</span>
                        </div>
                        <button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded-lg transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparison Table */}
                <div className="mt-3 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="text-xs font-medium text-gray-700 bg-gray-50 p-2 border-b border-gray-200">
                    Quick Comparison
                  </div>
                  <div className="p-2">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-1 font-medium text-gray-500">Feature</th>
                          <th className="text-center py-1 font-medium text-gray-500">Audio Studio</th>
                          <th className="text-center py-1 font-medium text-gray-500">Beat Maker</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-1 text-gray-700">Tracks</td>
                          <td className="py-1 text-center text-gray-700">Unlimited</td>
                          <td className="py-1 text-center text-gray-700">64</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-1 text-gray-700">Plugins</td>
                          <td className="py-1 text-center text-gray-700">100+</td>
                          <td className="py-1 text-center text-gray-700">50+</td>
                        </tr>
                        <tr>
                          <td className="py-1 text-gray-700">Best for</td>
                          <td className="py-1 text-center text-gray-700">Professionals</td>
                          <td className="py-1 text-center text-gray-700">Beginners</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="mt-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-2 border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <span className="font-medium">💡 Recommendation:</span> Based on your interest in music production,
                    I'd recommend Audio Studio Pro for professional work or Beat Maker 2023 if you're just starting out.
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 bg-white rounded-lg text-xs text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Add to Cart
                  </button>
                  <button className="px-3 py-1.5 bg-white rounded-lg text-xs text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Save to Wishlist
                  </button>
                  <button className="px-3 py-1.5 bg-white rounded-lg text-xs text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 px-2">03:22 PM</p>
            </div>
          </div>

          {/* User Message */}
          <div className="flex justify-end">
            <div className="max-w-[85%]">
              <div className="rounded-2xl p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
                <p className="text-sm">What's the difference between Audio Studio Pro and Beat Maker?</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 px-2 text-right">03:24 PM ✓</p>
            </div>
          </div>

          {/* Assistant Message with Comparison */}
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs">🤖</span>
                </div>
              </div>
              <div className="rounded-2xl p-3 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 shadow-sm">
                <p className="text-sm">
                  Great question! Here's a detailed comparison between Audio Studio Pro and Beat Maker 2023:
                </p>

                {/* Feature Comparison */}
                <div className="mt-3 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-3 text-xs">
                    <div className="p-2 font-medium text-gray-700 bg-gray-50 border-b border-gray-200">Feature</div>
                    <div className="p-2 font-medium text-gray-700 bg-gray-50 border-b border-r border-l border-gray-200">
                      Audio Studio Pro
                    </div>
                    <div className="p-2 font-medium text-gray-700 bg-gray-50 border-b border-gray-200">
                      Beat Maker 2023
                    </div>

                    <div className="p-2 text-gray-700 border-b border-gray-100">Target Users</div>
                    <div className="p-2 text-gray-700 border-b border-r border-l border-gray-100">
                      Professional producers
                    </div>
                    <div className="p-2 text-gray-700 border-b border-gray-100">Beginners & beat makers</div>

                    <div className="p-2 text-gray-700 border-b border-gray-100">Learning Curve</div>
                    <div className="p-2 text-gray-700 border-b border-r border-l border-gray-100">Steep</div>
                    <div className="p-2 text-gray-700 border-b border-gray-100">Moderate</div>

                    <div className="p-2 text-gray-700 border-b border-gray-100">Price</div>
                    <div className="p-2 text-gray-700 border-b border-r border-l border-gray-100">$89.99</div>
                    <div className="p-2 text-gray-700 border-b border-gray-100">$69.99</div>

                    <div className="p-2 text-gray-700">Best For</div>
                    <div className="p-2 text-gray-700 border-r border-l">Full music production</div>
                    <div className="p-2 text-gray-700">Beat creation & loops</div>
                  </div>
                </div>

                {/* Customer Reviews Snippet */}
                <div className="mt-3 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="text-xs font-medium text-gray-700 bg-gray-50 p-2 border-b border-gray-200">
                    What customers are saying
                  </div>
                  <div className="p-2 space-y-2">
                    <div className="text-xs">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-gray-700 font-medium">Audio Studio Pro</span>
                      </div>
                      <p className="text-gray-600 mt-1">
                        "Incredible depth of features. I've been using it for professional studio work for years."
                      </p>
                    </div>
                    <div className="text-xs">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Star className="w-3 h-3 text-gray-300" />
                        <span className="ml-1 text-gray-700 font-medium">Beat Maker 2023</span>
                      </div>
                      <p className="text-gray-600 mt-1">
                        "Perfect for beginners. I was making beats within minutes of installation."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personalized Recommendation */}
                <div className="mt-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-2 border border-green-200">
                  <p className="text-xs text-green-800">
                    <span className="font-medium">🎯 Personalized Recommendation:</span> Based on your questions, you
                    seem to be comparing options carefully. If you're serious about music production as a long-term
                    investment, Audio Studio Pro offers more room to grow. For quick beat creation with a gentler
                    learning curve, Beat Maker 2023 is ideal.
                  </p>
                </div>

                {/* Special Offer */}
                <div className="mt-3 bg-gradient-to-r from-yellow-50 to-amber-100 rounded-lg p-2 border border-amber-200 flex items-center">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white mr-2 flex-shrink-0">
                    %
                  </div>
                  <div>
                    <p className="text-xs font-medium text-amber-800">Limited Time Offer</p>
                    <p className="text-xs text-amber-700">Get 10% off Audio Studio Pro with code: ASSISTANT10</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs text-white transition-colors flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View Audio Studio Pro
                  </button>
                  <button className="px-3 py-1.5 bg-white rounded-lg text-xs text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View Beat Maker 2023
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 px-2">03:25 PM</p>
            </div>
          </div>

          {/* Typing Indicator */}
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs">🤖</span>
                </div>
              </div>
              <div className="rounded-2xl p-3 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 shadow-sm">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask about products, deals, or recommendations..."
                className="w-full pl-3 pr-16 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                  <Smile className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>
              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <span className="text-xs text-gray-500">Powered by ShopSmart AI</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Command className="w-3 h-3" />
              <span>↵ to send</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Add New Customer</h2>
            <button
              onClick={() => setShowAddCustomer(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              addCustomer({
                name: formData.get("name"),
                email: formData.get("email"),
              })
            }}
          >
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="customer@email.com"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                type="button"
                onClick={() => setShowAddCustomer(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Seller Modal */}
      {showAddSeller && (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Invite New Seller</h2>
            <button
              onClick={() => setShowAddSeller(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              addSeller({
                name: formData.get("name"),
                email: formData.get("email"),
              })
            }}
          >
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company/Seller Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="seller@company.com"
                />
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                An invitation email will be sent to the seller with setup instructions.
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                type="button"
                onClick={() => setShowAddSeller(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-0.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-2 h-3 bg-white rounded-full" />
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                  <p className="text-gray-600">by {selectedProduct.developer}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Product Info */}
                <div className="space-y-4">
                  {/* Main Product Image */}
                  <div>
                    <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-md mb-4">
                      <img
                        src={
                          selectedProduct.mainImage ||
                          `/placeholder.svg?height=256&width=400&query=${selectedProduct.name || "/placeholder.svg"}+main+preview`
                        }
                        alt={`${selectedProduct.name} main preview`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Four Product Images */}
                    <div className="grid grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map((index) => (
                        <div
                          key={index}
                          className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                        >
                          <img
                            src={`/placeholder.svg?height=120&width=120&query=${selectedProduct.name}+image+${index}`}
                            alt={`${selectedProduct.name} image ${index}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-700">{selectedProduct.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {selectedProduct.features.map((feature, index) => (
                        <li key={index} className="text-gray-700">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column - Purchase and Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">${selectedProduct.price}</span>
                      {selectedProduct.originalPrice && (
                        <span className="text-gray-500 line-through ml-2">${selectedProduct.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-medium text-gray-900">{selectedProduct.rating}</span>
                      <span className="text-gray-500">({selectedProduct.reviews} reviews)</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleBuyNow(selectedProduct)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Buy Now
                    </button>
                    <button
                      onClick={() => addToCart(selectedProduct)}
                      className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </button>
                  </div>

                  {/* Social Proof Section */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">Live Activity</span>
                    </div>
                    <div className="space-y-2 text-sm text-green-600">
                      <p>• 3 people purchased this in the last hour</p>
                      <p>• 127 people are viewing this product</p>
                      <p>• Top seller in {selectedProduct.category} category</p>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Verified Seller</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">⚡</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Instant Download</span>
                    </div>
                  </div>

                  {/* Reviews Section */}
                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Customer Reviews</h4>
                      {isAuthenticated && (
                        <button
                          onClick={() => openReviewModal(selectedProduct)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                        >
                          Write a Review
                        </button>
                      )}
                    </div>

                    {/* Review List */}
                    <div className="space-y-4">
                      {getProductReviews(selectedProduct.id).map((review) => (
                        <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <img
                              src={review.userAvatar || "/placeholder.svg"}
                              alt={review.userName}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{review.userName}</p>
                              <div className="flex items-center space-x-1">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                                <span className="text-gray-500 text-sm">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <h5 className="font-semibold text-gray-900 mb-1">{review.title}</h5>
                          <p className="text-gray-700">{review.comment}</p>
                          <div className="flex items-center space-x-4 mt-3">
                            <button
                              onClick={() => handleHelpfulReview(review.id)}
                              className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors flex items-center space-x-1"
                            >
                              <span>Helpful?</span>
                              <span>({review.helpful})</span>
                            </button>
                            {review.verified && (
                              <span className="text-green-600 text-sm font-medium flex items-center space-x-1">
                                <span>Verified Purchase</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Modal */}
      <ShoppingCartModal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cartItems={cartItems}
        updateQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
        onCheckout={() => {
          setShowCart(false)
          setShowCheckoutModal(true)
        }}
      />

      {/* Checkout Flow */}
      {showCheckoutModal && (
        <CheckoutFlow
          cartItems={cartItems}
          onClose={() => setShowCheckoutModal(false)}
          onComplete={() => {
            setCartItems([])
            setShowCheckoutModal(false)
          }}
        />
      )}
    </div>
  )
}

export default function DigitalStoreApp() {
  const [currentPage, setCurrentPage] = useState<Page>("home")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [chatMessage, setChatMessage] = useState("")
  const [showDashboardSelector, setShowDashboardSelector] = useState(false)

  // Add all the product data and other state here
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: "Audio Studio Pro",
      price: 89.99,
      originalPrice: 119.99,
      rating: 4.8,
      discount: "-25%",
      category: "Software",
      description:
        "The ultimate software for professional audio recording, mixing, and mastering. Includes a vast library of effects and virtual instruments.",
      features: [
        "Multi-track recording",
        "Advanced mixing console",
        "Extensive plugin support",
        "Virtual instrument suite",
        "Mastering tools",
      ],
      screenshots: [
        "/placeholder.svg?height=256&width=400&query=audio+studio+pro+screenshot+1",
        "/placeholder.svg?height=256&width=400&query=audio+studio+pro+screenshot+2",
        "/placeholder.svg?height=256&width=400&query=audio+studio+pro+screenshot+3",
      ],
      reviews: 235,
      downloads: "12,589",
      lastUpdated: "2024-01-20",
      developer: "AudioTech Studios",
      status: "active",
      sales: 568,
      revenue: 50000,
      mainImage: "/placeholder.svg?height=256&width=400&query=audio+studio+pro+main+preview",
    },
    {
      id: 2,
      name: "Beat Maker 2023",
      price: 69.99,
      originalPrice: 89.99,
      rating: 4.6,
      discount: "-22%",
      category: "Music & Audio",
      description:
        "Create professional-quality beats with this easy-to-use software. Features a wide range of drum kits, synthesizers, and effects.",
      features: [
        "Intuitive beat sequencer",
        "Extensive sound library",
        "Real-time effects processing",
        "MIDI controller support",
        "Export to multiple formats",
      ],
      screenshots: [
        "/placeholder.svg?height=256&width=400&query=beat+maker+2023+screenshot+1",
        "/placeholder.svg?height=256&width=400&query=beat+maker+2023+screenshot+2",
        "/placeholder.svg?height=256&width=400&query=beat+maker+2023+screenshot+3",
      ],
      reviews: 187,
      downloads: "9,234",
      lastUpdated: "2024-01-15",
      developer: "BeatCraft Inc",
      status: "active",
      sales: 420,
      revenue: 30000,
      mainImage: "/placeholder.svg?height=256&width=400&query=beat+maker+2023+main+preview",
    },
    {
      id: 3,
      name: "E-Book Creator Plus",
      price: 49.99,
      originalPrice: 59.99,
      rating: 4.5,
      discount: "-17%",
      category: "E-books",
      description:
        "Write, format, and publish your e-books with ease. Supports multiple formats and includes templates for various genres.",
      features: [
        "User-friendly writing interface",
        "Automatic formatting",
        "Cover design tools",
        "Export to EPUB, MOBI, PDF",
        "Royalty tracking",
      ],
      screenshots: [
        "/placeholder.svg?height=256&width=400&query=e-book+creator+plus+screenshot+1",
        "/placeholder.svg?height=256&width=400&query=e-book+creator+plus+screenshot+2",
        "/placeholder.svg?height=256&width=400&query=e-book+creator+plus+screenshot+3",
      ],
      reviews: 152,
      downloads: "7,890",
      lastUpdated: "2024-01-10",
      developer: "Literary Apps",
      status: "active",
      sales: 350,
      revenue: 17500,
      mainImage: "/placeholder.svg?height=256&width=400&query=e-book+creator+plus+main+preview",
    },
    {
      id: 4,
      name: "Digital Art Studio",
      price: 79.99,
      originalPrice: 99.99,
      rating: 4.7,
      discount: "-20%",
      category: "Graphics & Design",
      description:
        "Create stunning digital art with this comprehensive studio. Includes a wide range of brushes, filters, and effects.",
      features: [
        "Realistic painting tools",
        "Layer-based editing",
        "Advanced color management",
        "Animation support",
        "Export to various formats",
      ],
      screenshots: [
        "/placeholder.svg?height=256&width=400&query=digital+art+studio+screenshot+1",
        "/placeholder.svg?height=256&width=400&query=digital+art+studio+screenshot+2",
        "/placeholder.svg?height=256&width=400&query=digital+art+studio+screenshot+3",
      ],
      reviews: 210,
      downloads: "11,234",
      lastUpdated: "2024-01-05",
      developer: "Creative Software Inc",
      status: "active",
      sales: 480,
      revenue: 38400,
      mainImage: "/placeholder.svg?height=256&width=400&query=digital+art+studio+main+preview",
    },
  ])

  // Handle login
  const handleLogin = (user: UserType) => {
    setCurrentUser(user)
    setIsAuthenticated(true)
  }

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
    setCurrentPage("home")
  }

  // Quick login as different user types for testing
  const loginAsCustomer = () => {
    const customerUser: UserType = {
      id: 101,
      name: "John Customer",
      email: "customer@example.com",
      avatar: "/placeholder.svg?height=40&width=40&query=customer+avatar",
      joinDate: "Jan 2024",
      totalPurchases: 5,
      totalSpent: 299.95,
      role: "customer",
    }
    setCurrentUser(customerUser)
    setIsAuthenticated(true)
    setCurrentPage("customer-dashboard")
    setShowDashboardSelector(false)
  }

  const loginAsSeller = () => {
    const sellerUser: UserType = {
      id: 102,
      name: "Jane Seller",
      email: "seller@example.com",
      avatar: "/placeholder.svg?height=40&width=40&query=seller+avatar",
      joinDate: "Dec 2023",
      totalPurchases: 0,
      totalSpent: 0,
      role: "seller",
    }
    setCurrentUser(sellerUser)
    setIsAuthenticated(true)
    setCurrentPage("seller-dashboard")
    setShowDashboardSelector(false)
  }

  const loginAsAdmin = () => {
    const adminUser: UserType = {
      id: 103,
      name: "Admin User",
      email: "admin@example.com",
      avatar: "/placeholder.svg?height=40&width=40&query=admin+avatar",
      joinDate: "Nov 2023",
      totalPurchases: 0,
      totalSpent: 0,
      role: "admin",
    }
    setCurrentUser(adminUser)
    setIsAuthenticated(true)
    setCurrentPage("admin-dashboard")
    setShowDashboardSelector(false)
  }

  // Render different pages based on currentPage
  if (currentPage === "login") {
    return <LoginPage onLogin={handleLogin} setCurrentPage={setCurrentPage} />
  }

  if (currentPage === "register") {
    return <RegisterPage onRegister={handleLogin} setCurrentPage={setCurrentPage} />
  }

  if (currentPage === "customer-dashboard" && isAuthenticated) {
    return (
      <CustomerDashboard
        currentUser={currentUser}
        setCurrentPage={setCurrentPage}
        orders={[
          {
            id: "ORD-001",
            customerName: "John Customer",
            customerEmail: "customer@example.com",
            productName: "Audio Studio Pro",
            amount: 89.99,
            status: "completed",
            date: "2024-01-15",
            paymentMethod: "Credit Card",
          },
          {
            id: "ORD-002",
            customerName: "John Customer",
            customerEmail: "customer@example.com",
            productName: "Beat Maker 2023",
            amount: 69.99,
            status: "completed",
            date: "2024-01-14",
            paymentMethod: "PayPal",
          },
        ]}
        wishlistItems={[products[0], products[2]]}
      />
    )
  }

  if (currentPage === "seller-dashboard" && isAuthenticated) {
    return (
      <SellerDashboard
        currentUser={currentUser}
        setCurrentPage={setCurrentPage}
        products={products}
        orders={[
          {
            id: "ORD-001",
            customerName: "John Smith",
            customerEmail: "john.smith@email.com",
            productName: "Audio Studio Pro",
            amount: 89.99,
            status: "completed",
            date: "2024-01-15",
            paymentMethod: "Credit Card",
          },
          {
            id: "ORD-002",
            customerName: "Sarah Johnson",
            customerEmail: "sarah.j@email.com",
            productName: "Beat Maker 2023",
            amount: 69.99,
            status: "completed",
            date: "2024-01-14",
            paymentMethod: "PayPal",
          },
        ]}
      />
    )
  }

  if (currentPage === "admin-dashboard" && isAuthenticated) {
    return (
      <AdminDashboard
        currentUser={currentUser}
        setCurrentPage={setCurrentPage}
        users={[
          {
            id: 1,
            name: "John Smith",
            email: "john.smith@email.com",
            joinDate: "Jan 2024",
            totalPurchases: 5,
            totalSpent: 299.95,
            status: "active",
            role: "customer",
            avatar: "/placeholder.svg?height=40&width=40&query=user+avatar+1",
          },
          {
            id: 2,
            name: "AudioTech Studios",
            email: "contact@audiotech.com",
            joinDate: "March 2023",
            totalPurchases: 0,
            totalSpent: 0,
            status: "active",
            role: "seller",
            avatar: "/placeholder.svg?height=40&width=40&query=user+avatar+2",
          },
        ]}
        products={products}
        orders={[
          {
            id: "ORD-001",
            customerName: "John Smith",
            customerEmail: "john.smith@email.com",
            productName: "Audio Studio Pro",
            amount: 89.99,
            status: "completed",
            date: "2024-01-15",
            paymentMethod: "Credit Card",
          },
          {
            id: "ORD-002",
            customerName: "Sarah Johnson",
            customerEmail: "sarah.j@email.com",
            productName: "Beat Maker 2023",
            amount: 69.99,
            status: "completed",
            date: "2024-01-14",
            paymentMethod: "PayPal",
          },
        ]}
      />
    )
  }

  // Dashboard selector modal
  const DashboardSelector = () => {
    if (!showDashboardSelector) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Select Dashboard</h2>
            <button
              onClick={() => setShowDashboardSelector(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <button
              onClick={loginAsCustomer}
              className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <User className="w-6 h-6 text-blue-600 mr-3" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Customer Dashboard</h3>
                  <p className="text-sm text-gray-500">View orders, downloads, and wishlist</p>
                </div>
              </div>
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Customer</div>
            </button>

            <button
              onClick={loginAsSeller}
              className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Store className="w-6 h-6 text-purple-600 mr-3" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Seller Dashboard</h3>
                  <p className="text-sm text-gray-500">Manage products, sales, and analytics</p>
                </div>
              </div>
              <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Seller</div>
            </button>

            <button
              onClick={loginAsAdmin}
              className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-red-600 mr-3" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Admin Dashboard</h3>
                  <p className="text-sm text-gray-500">Manage users, products, and platform settings</p>
                </div>
              </div>
              <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Admin</div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Default to HomePage
  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDashboardSelector(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <span>View Dashboards</span>
        </button>
      </div>

      <HomePage
        products={products}
        chatMessage={chatMessage}
        setChatMessage={setChatMessage}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
        setCurrentUser={setCurrentUser}
        setIsAuthenticated={setIsAuthenticated}
      />

      <DashboardSelector />
    </>
  )
}
