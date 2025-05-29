"use client"

import { useState } from "react"
import { Search, ShoppingCart, Heart, Download, Star, Sparkles, Send, Paperclip, Smile, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Component() {
  const [searchQuery, setSearchQuery] = useState("Digital music software")
  const [chatMessage, setChatMessage] = useState("")

  const categories = [
    { name: "All", active: true },
    { name: "Software", icon: "💻" },
    { name: "Music & Audio", icon: "🎵" },
    { name: "E-books", icon: "📚" },
    { name: "Graphics & Design", icon: "🎨" },
    { name: "Games", icon: "🎮" },
  ]

  const products = [
    {
      id: 1,
      name: "Audio Studio Pro",
      price: 89.99,
      originalPrice: 119.99,
      rating: 4.8,
      discount: "25% OFF",
      image: "/placeholder.svg?height=200&width=300&query=audio+studio+software+interface",
      category: "Digital",
    },
    {
      id: 2,
      name: "Beat Maker 2023",
      price: 69.99,
      originalPrice: 99.99,
      rating: 4.6,
      discount: "30% OFF",
      image: "/placeholder.svg?height=200&width=300&query=beat+maker+music+software",
      category: "Digital",
    },
    {
      id: 3,
      name: "E-Book Creator Plus",
      price: 49.99,
      originalPrice: 79.99,
      rating: 4.7,
      discount: "38% OFF",
      image: "/placeholder.svg?height=200&width=300&query=ebook+creator+software",
      category: "Digital",
    },
    {
      id: 4,
      name: "Digital Art Studio",
      price: 59.99,
      originalPrice: 89.99,
      rating: 4.5,
      discount: "35% OFF",
      image: "/placeholder.svg?height=200&width=300&query=digital+art+studio+software",
      category: "Digital",
    },
  ]

  const chatMessages = [
    {
      id: 1,
      type: "assistant",
      content:
        "👋 Hello! I'm your AI shopping assistant for digital downloads. How can I help you find the perfect software, e-books, music, or other digital products today?",
      time: "2:30 PM",
    },
    {
      id: 2,
      type: "user",
      content: "Digital music software",
      time: "03:21 PM",
    },
    {
      id: 3,
      type: "assistant",
      content:
        "🎵 Great choice! I found some excellent digital music software options with instant download. Here's a top-rated recommendation:",
      time: "03:21 PM",
      product: {
        name: "Audio Studio Pro",
        rating: 4.8,
        price: "$89",
        originalPrice: "$119",
        image: "/placeholder.svg?height=60&width=60&query=audio+studio+pro+icon",
      },
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <div>
                  <h1 className="font-bold text-lg">DigitalStore</h1>
                  <p className="text-xs text-gray-500">Digital Downloads</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-gray-600 text-white">
                v0 block
              </Badge>
            </div>

            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-20 py-2 w-full"
                  placeholder="Search for digital products..."
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="w-5 h-5" />
              </Button>
              <Button variant="outline">Login</Button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center space-x-6">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={category.active ? "default" : "ghost"}
                size="sm"
                className={category.active ? "bg-gray-900 text-white" : "text-gray-600"}
              >
                {category.icon && <span className="mr-1">{category.icon}</span>}
                {category.name}
              </Button>
            ))}
          </div>
        </nav>

        {/* Filters and Actions */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm">
              <span className="mr-2">⚙️</span>
              Filters
            </Button>
            <Button variant="outline" size="sm" className="text-purple-600 border-purple-200">
              <Sparkles className="w-4 h-4 mr-2" />
              Discover Something New
            </Button>
          </div>
        </div>

        {/* Results */}
        <main className="px-6 py-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Results for "Digital music software"</h2>
            <p className="text-gray-600">{products.length} products found</p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden border-0 shadow-lg">
                <div className="relative bg-gradient-to-br from-purple-500 to-purple-700 p-6 h-48">
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white">{product.discount}</Badge>
                  <div className="flex items-center justify-center h-full">
                    <div className="w-24 h-16 bg-gray-900 rounded-lg flex items-center justify-center">
                      <div className="grid grid-cols-4 gap-1 p-2">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full ${
                              i % 3 === 0 ? "h-3 bg-blue-400" : i % 3 === 1 ? "h-4 bg-green-400" : "h-2 bg-purple-400"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <Download className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Instant Download</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">${product.price}</span>
                      <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                    </div>
                    <Badge variant="outline" className="text-purple-600 border-purple-200">
                      {product.category}
                    </Badge>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>

      {/* AI Assistant Chat */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32&query=ai+assistant+avatar" />
              <AvatarFallback className="bg-blue-600 text-white">🤖</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-xs text-gray-500">Ask me anything about products and downloads</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}>
                {message.type === "assistant" && (
                  <div className="flex items-center space-x-2 mb-1">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-blue-600 text-white text-xs">🤖</AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <div
                  className={`rounded-lg p-3 ${
                    message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.product && (
                    <div className="mt-3 p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                          <div className="grid grid-cols-2 gap-0.5">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="w-1 h-2 bg-white rounded-full" />
                            ))}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{message.product.name}</h4>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{message.product.rating}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm">{message.product.price}</span>
                            <span className="text-xs text-gray-500 line-through">{message.product.originalPrice}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 px-2">{message.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Powered by Operator AI</p>
        </div>
      </div>
    </div>
  )
}
