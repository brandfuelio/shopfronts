"use client"

import { X, Filter } from "lucide-react"

interface FiltersModalProps {
  isOpen: boolean
  onClose: () => void
  priceRange: { min: number; max: number }
  setPriceRange: (range: { min: number; max: number }) => void
  sortBy: string
  setSortBy: (sort: string) => void
}

export default function FiltersModal({
  isOpen,
  onClose,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
}: FiltersModalProps) {
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
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>${priceRange.min}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full relative">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      marginLeft: `${(priceRange.min / 500) * 100}%`,
                      width: `${((priceRange.max - priceRange.min) / 500) * 100}%`,
                    }}
                  />
                </div>
                <span>${priceRange.max}</span>
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
