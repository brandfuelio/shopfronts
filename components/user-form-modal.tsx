"use client"

import type React from "react"

import { useState } from "react"
import { X, Mail, User, Shield } from "lucide-react"

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (user: any) => void
  user?: any
  mode: "create" | "edit"
}

export default function UserFormModal({ isOpen, onClose, onSave, user, mode }: UserFormModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "customer",
    avatar: user?.avatar || "",
    password: "",
    confirmPassword: "",
    sendWelcomeEmail: true,
    requireEmailVerification: true,
  })

  const [errors, setErrors] = useState<any>({})

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"

    if (mode === "create") {
      if (!formData.password) newErrors.password = "Password is required"
      if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const userData = {
      ...formData,
      id: user?.id || Date.now(),
      joinDate: user?.joinDate || new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      totalPurchases: user?.totalPurchases || 0,
      totalSpent: user?.totalSpent || 0,
      status: user?.status || "active",
      emailVerified: user?.emailVerified || !formData.requireEmailVerification,
    }

    // Remove password fields from the data sent to parent
    const { password, confirmPassword, ...userDataToSave } = userData
    onSave(userDataToSave)
    onClose()
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4 text-red-600" />
      case "seller":
        return <User className="w-4 h-4 text-blue-600" />
      default:
        return <User className="w-4 h-4 text-green-600" />
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Full platform access and management capabilities"
      case "seller":
        return "Can create and manage products, view sales analytics"
      case "customer":
        return "Can purchase and download products"
      default:
        return ""
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{mode === "create" ? "Add New User" : "Edit User"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
              <div className="space-y-3">
                {["customer", "seller", "admin"].map((role) => (
                  <div
                    key={role}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.role === role ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                    onClick={() => setFormData({ ...formData, role })}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={formData.role === role}
                        onChange={() => setFormData({ ...formData, role })}
                        className="text-blue-600"
                      />
                      {getRoleIcon(role)}
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 capitalize">{role}</span>
                        <p className="text-sm text-gray-500">{getRoleDescription(role)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Password Fields (only for create mode) */}
            {mode === "create" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter password"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture (Optional)</label>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter image URL"
              />
            </div>

            {/* Options (only for create mode) */}
            {mode === "create" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Send Welcome Email</label>
                    <p className="text-xs text-gray-500">Send account details and welcome message</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, sendWelcomeEmail: !formData.sendWelcomeEmail })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.sendWelcomeEmail ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.sendWelcomeEmail ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Require Email Verification</label>
                    <p className="text-xs text-gray-500">User must verify email before accessing account</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, requireEmailVerification: !formData.requireEmailVerification })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.requireEmailVerification ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.requireEmailVerification ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Preview */}
            {formData.avatar && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
                <div className="flex items-center space-x-3">
                  <img
                    src={formData.avatar || "/placeholder.svg"}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{formData.name || "User Name"}</p>
                    <p className="text-sm text-gray-500">{formData.email || "user@email.com"}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {getRoleIcon(formData.role)}
                      <span className="text-xs text-gray-600 capitalize">{formData.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              {mode === "create" ? (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Create User</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  <span>Update User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
