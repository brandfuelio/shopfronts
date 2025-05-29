"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload, Plus, Minus, Link, Info, ExternalLink } from "lucide-react"

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: any) => void
  product?: any
  mode: "create" | "edit"
}

export default function ProductFormModal({ isOpen, onClose, onSave, product, mode }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    originalPrice: product?.originalPrice || "",
    category: product?.category || "Software",
    features: product?.features || [""],
    tags: product?.tags || "",
    status: product?.status || "draft",
    mainImage: product?.mainImage || "",
    screenshots: product?.screenshots || [""],
    downloadLinks: product?.downloadLinks || [{ name: "", url: "", description: "" }],
    instructions: product?.instructions || "",
  })

  const [errors, setErrors] = useState<any>({})

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.name.trim()) newErrors.name = "Product name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.price || Number.parseFloat(formData.price) <= 0) newErrors.price = "Valid price is required"
    if (formData.features.filter((f) => f.trim()).length === 0) newErrors.features = "At least one feature is required"

    // Validate download links
    const validDownloadLinks = formData.downloadLinks.filter((link) => link.name.trim() && link.url.trim())
    if (validDownloadLinks.length === 0) {
      newErrors.downloadLinks = "At least one download link is required"
    } else {
      // Validate URL format
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
      const invalidUrls = validDownloadLinks.filter((link) => !urlPattern.test(link.url))
      if (invalidUrls.length > 0) {
        newErrors.downloadLinks = "Please provide valid URLs for all download links"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const productData = {
      ...formData,
      price: Number.parseFloat(formData.price),
      originalPrice: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : null,
      features: formData.features.filter((f) => f.trim()),
      screenshots: formData.screenshots.filter((s) => s.trim()),
      downloadLinks: formData.downloadLinks.filter((link) => link.name.trim() && link.url.trim()),
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      id: product?.id || Date.now(),
      rating: product?.rating || 0,
      reviews: product?.reviews || 0,
      downloads: product?.downloads || "0",
      lastUpdated: new Date().toISOString(),
      developer: product?.developer || "Current User",
    }

    onSave(productData)
    onClose()
  }

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] })
  }

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index)
    setFormData({ ...formData, features: newFeatures })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({ ...formData, features: newFeatures })
  }

  const addScreenshot = () => {
    setFormData({ ...formData, screenshots: [...formData.screenshots, ""] })
  }

  const removeScreenshot = (index: number) => {
    const newScreenshots = formData.screenshots.filter((_, i) => i !== index)
    setFormData({ ...formData, screenshots: newScreenshots })
  }

  const updateScreenshot = (index: number, value: string) => {
    const newScreenshots = [...formData.screenshots]
    newScreenshots[index] = value
    setFormData({ ...formData, screenshots: newScreenshots })
  }

  const addDownloadLink = () => {
    setFormData({
      ...formData,
      downloadLinks: [...formData.downloadLinks, { name: "", url: "", description: "" }],
    })
  }

  const removeDownloadLink = (index: number) => {
    const newDownloadLinks = formData.downloadLinks.filter((_, i) => i !== index)
    setFormData({ ...formData, downloadLinks: newDownloadLinks })
  }

  const updateDownloadLink = (index: number, field: string, value: string) => {
    const newDownloadLinks = [...formData.downloadLinks]
    newDownloadLinks[index] = { ...newDownloadLinks[index], [field]: value }
    setFormData({ ...formData, downloadLinks: newDownloadLinks })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{mode === "create" ? "Add New Product" : "Edit Product"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Software">Software</option>
                  <option value="Music & Audio">Music & Audio</option>
                  <option value="E-books">E-books</option>
                  <option value="Graphics & Design">Graphics & Design</option>
                  <option value="Games">Games</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe your product..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Download Links Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3 mb-4">
                <Link className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Links *</h3>
                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">How it works:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                          <li>Upload your files to cloud storage (Google Drive, Dropbox, OneDrive, etc.)</li>
                          <li>Generate shareable download links for your files</li>
                          <li>Add those links here - customers will receive them after purchase</li>
                          <li>Make sure links are accessible and won't expire</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {formData.downloadLinks.map((link, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">File Name *</label>
                            <input
                              type="text"
                              value={link.name}
                              onChange={(e) => updateDownloadLink(index, "name", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Main Software Package"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Download URL *</label>
                            <div className="relative">
                              <input
                                type="url"
                                value={link.url}
                                onChange={(e) => updateDownloadLink(index, "url", e.target.value)}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://drive.google.com/..."
                              />
                              <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                          <input
                            type="text"
                            value={link.description}
                            onChange={(e) => updateDownloadLink(index, "description", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Includes installation guide and bonus materials"
                          />
                        </div>
                        {formData.downloadLinks.length > 1 && (
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeDownloadLink(index)}
                              className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-1"
                            >
                              <Minus className="w-4 h-4" />
                              <span>Remove</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addDownloadLink}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Another Download Link</span>
                    </button>
                  </div>
                  {errors.downloadLinks && <p className="text-red-500 text-sm mt-2">{errors.downloadLinks}</p>}
                </div>
              </div>
            </div>

            {/* Customer Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional instructions for customers after purchase (e.g., installation steps, license key usage, etc.)"
              />
              <p className="text-xs text-gray-500 mt-1">
                These instructions will be shown to customers along with their download links
              </p>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features *</label>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter a feature"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Feature</span>
                </button>
              </div>
              {errors.features && <p className="text-red-500 text-sm mt-1">{errors.features}</p>}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="music, audio, production, software"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main Product Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-2">Upload to image hosting service and paste URL</p>
                <input
                  type="url"
                  value={formData.mainImage}
                  onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  placeholder="https://your-image-host.com/image.jpg"
                />
              </div>
            </div>

            {/* Screenshots */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Screenshots</label>
              <div className="space-y-2">
                {formData.screenshots.map((screenshot, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={screenshot}
                      onChange={(e) => updateScreenshot(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://your-image-host.com/screenshot.jpg"
                    />
                    {formData.screenshots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addScreenshot}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Screenshot</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-6 border-t border-gray-200 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {mode === "create" ? "Create Product" : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
