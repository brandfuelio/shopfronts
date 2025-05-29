"use client"

import { useState } from "react"
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
  Filter,
} from "lucide-react"

export default function Component() {
  const [chatMessage, setChatMessage] = useState("")

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and badge */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <div>
                  <h1 className="font-bold text-lg text-gray-900 leading-tight">DigitalStore</h1>
                  <p className="text-xs text-gray-500 leading-tight">Digital Downloads</p>
                </div>
              </div>
              <div className="bg-gray-700 text-white text-xs px-2 py-1 rounded font-medium">v0 block</div>
            </div>

            {/* Center - Search bar */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="text-gray-400 w-4 h-4" />
                </div>
                <input
                  defaultValue="Digital music software"
                  className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Mic className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Search className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - Cart and Login */}
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
              </button>
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Login</button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <button className="bg-gray-900 text-white px-4 py-2 text-sm rounded-full font-medium">All</button>
            <button className="px-4 py-2 text-sm text-gray-600 rounded-full hover:bg-gray-100 font-medium">
              💻 Software
            </button>
            <button className="px-4 py-2 text-sm text-gray-600 rounded-full hover:bg-gray-100 font-medium">
              🎵 Music & Audio
            </button>
            <button className="px-4 py-2 text-sm text-gray-600 rounded-full hover:bg-gray-100 font-medium">
              📚 E-books
            </button>
            <button className="px-4 py-2 text-sm text-gray-600 rounded-full hover:bg-gray-100 font-medium">
              🎨 Graphics & Design
            </button>
            <button className="px-4 py-2 text-sm text-gray-600 rounded-full hover:bg-gray-100 font-medium">
              🎮 Games
            </button>
          </div>
        </nav>

        {/* Filters and Actions */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button className="flex items-center px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button className="flex items-center px-4 py-2 text-sm text-purple-600 border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100">
              <Sparkles className="w-4 h-4 mr-2" />
              Discover Something New
            </button>
          </div>
        </div>

        {/* Results */}
        <main className="px-6 py-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Results for "Digital music software"</h2>
            <p className="text-gray-600 text-sm">4 products found</p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Audio Studio Pro */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 h-52">
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                  25% OFF
                </div>
                <div className="flex items-center justify-center h-full">
                  <div className="w-28 h-20 bg-gray-900 rounded-lg border-t-4 border-gray-700 relative shadow-lg">
                    <div className="absolute top-1 left-1 right-1 flex space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="mt-4 px-3 py-2">
                      <div className="grid grid-cols-8 gap-1 h-8 items-end">
                        {[
                          6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5,
                          3,
                        ].map((height, i) => (
                          <div
                            key={i}
                            className={`w-full rounded-full ${
                              i % 4 === 0
                                ? "bg-blue-400"
                                : i % 4 === 1
                                  ? "bg-green-400"
                                  : i % 4 === 2
                                    ? "bg-purple-400"
                                    : "bg-cyan-400"
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
                  <h3 className="font-semibold text-gray-900 text-base">Audio Studio Pro</h3>
                  <button className="p-1">
                    <Heart className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="flex items-center space-x-1 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-900">4.8</span>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <Download className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Instant Download</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">$89.99</span>
                    <span className="text-sm text-gray-500">$</span>
                  </div>
                  <div className="text-purple-600 border border-purple-200 bg-purple-50 px-2 py-1 rounded text-xs font-medium">
                    💻 Digital
                  </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Buy Now
                </button>
              </div>
            </div>

            {/* Beat Maker 2023 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 h-52">
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                  30% OFF
                </div>
                <div className="flex items-center justify-center h-full">
                  <div className="w-28 h-20 bg-gray-900 rounded-lg border-t-4 border-gray-700 relative shadow-lg">
                    <div className="absolute top-1 left-1 right-1 flex space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="mt-4 px-3 py-2">
                      <div className="grid grid-cols-8 gap-1 h-8 items-end">
                        {[
                          5, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4,
                          5,
                        ].map((height, i) => (
                          <div
                            key={i}
                            className={`w-full rounded-full ${
                              i % 4 === 0
                                ? "bg-blue-400"
                                : i % 4 === 1
                                  ? "bg-green-400"
                                  : i % 4 === 2
                                    ? "bg-purple-400"
                                    : "bg-cyan-400"
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
                  <h3 className="font-semibold text-gray-900 text-base">Beat Maker 2023</h3>
                  <button className="p-1">
                    <Heart className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="flex items-center space-x-1 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-900">4.6</span>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <Download className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Instant Download</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">$69.99</span>
                    <span className="text-sm text-gray-500">$</span>
                  </div>
                  <div className="text-purple-600 border border-purple-200 bg-purple-50 px-2 py-1 rounded text-xs font-medium">
                    💻 Digital
                  </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Buy Now
                </button>
              </div>
            </div>

            {/* E-Book Creator Plus */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 h-52">
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                  38% OFF
                </div>
                <div className="flex items-center justify-center h-full">
                  <div className="w-28 h-20 bg-gray-900 rounded-lg border-t-4 border-gray-700 relative shadow-lg">
                    <div className="absolute top-1 left-1 right-1 flex space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="mt-4 px-3 py-2">
                      <div className="grid grid-cols-8 gap-1 h-8 items-end">
                        {[
                          4, 5, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6,
                          4,
                        ].map((height, i) => (
                          <div
                            key={i}
                            className={`w-full rounded-full ${
                              i % 4 === 0
                                ? "bg-blue-400"
                                : i % 4 === 1
                                  ? "bg-green-400"
                                  : i % 4 === 2
                                    ? "bg-purple-400"
                                    : "bg-cyan-400"
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
                  <h3 className="font-semibold text-gray-900 text-base">E-Book Creator Plus</h3>
                  <button className="p-1">
                    <Heart className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="flex items-center space-x-1 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-900">4.7</span>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <Download className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Instant Download</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">$49.99</span>
                    <span className="text-sm text-gray-500">$</span>
                  </div>
                  <div className="text-purple-600 border border-purple-200 bg-purple-50 px-2 py-1 rounded text-xs font-medium">
                    💻 Digital
                  </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Digital Art Studio - Bottom row */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 h-52">
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                  35% OFF
                </div>
                <div className="flex items-center justify-center h-full">
                  <div className="w-28 h-20 bg-gray-900 rounded-lg border-t-4 border-gray-700 relative shadow-lg">
                    <div className="absolute top-1 left-1 right-1 flex space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="mt-4 px-3 py-2">
                      <div className="grid grid-cols-8 gap-1 h-8 items-end">
                        {[
                          3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4, 5, 3, 6, 4,
                          5,
                        ].map((height, i) => (
                          <div
                            key={i}
                            className={`w-full rounded-full ${
                              i % 4 === 0
                                ? "bg-blue-400"
                                : i % 4 === 1
                                  ? "bg-green-400"
                                  : i % 4 === 2
                                    ? "bg-purple-400"
                                    : "bg-cyan-400"
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
                  <h3 className="font-semibold text-gray-900 text-base">Digital Art Studio</h3>
                  <button className="p-1">
                    <Heart className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="flex items-center space-x-1 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-900">4.5</span>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <Download className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Instant Download</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">$59.99</span>
                    <span className="text-sm text-gray-500">$</span>
                  </div>
                  <div className="text-purple-600 border border-purple-200 bg-purple-50 px-2 py-1 rounded text-xs font-medium">
                    💻 Digital
                  </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* AI Assistant Chat */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-xs text-gray-500">Ask me anything about products and downloads</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Assistant Message 1 */}
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🤖</span>
                </div>
              </div>
              <div className="rounded-lg p-3 bg-gray-100 text-gray-900">
                <p className="text-sm">
                  👋 Hello! I'm your AI shopping assistant for digital downloads. How can I help you find the perfect
                  software, e-books, music, or other digital products today?
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1 px-2">2:30 PM</p>
            </div>
          </div>

          {/* User Message */}
          <div className="flex justify-end">
            <div className="max-w-[85%]">
              <div className="rounded-lg p-3 bg-blue-600 text-white">
                <p className="text-sm">Digital music software</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 px-2 text-right">03:21 PM ✓</p>
            </div>
          </div>

          {/* Assistant Message 2 with Product */}
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🤖</span>
                </div>
              </div>
              <div className="rounded-lg p-3 bg-gray-100 text-gray-900">
                <p className="text-sm">
                  🎵 Great choice! I found some excellent digital music software options with instant download. Here's a
                  top-rated recommendation:
                </p>

                {/* Product Card in Chat */}
                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="grid grid-cols-3 gap-0.5">
                        {[3, 2, 4, 3, 2, 4, 3, 2, 4].map((height, i) => (
                          <div key={i} className="w-1 bg-white rounded-full" style={{ height: `${height * 2}px` }} />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900">Audio Studio Pro</h4>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">4.8</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-bold text-sm text-gray-900">$89</span>
                        <span className="text-xs text-gray-500 line-through">$119</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 px-2">03:21 PM</p>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full pl-3 pr-16 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Smile className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-lg">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Powered by Operator AI</p>
        </div>
      </div>
    </div>
  )
}
