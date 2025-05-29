"use client"

import { useState, useEffect } from "react"
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from "lucide-react"

interface EmailVerificationPageProps {
  userEmail?: string
  setCurrentPage: (page: string) => void
}

export default function EmailVerificationPage({
  userEmail = "user@example.com",
  setCurrentPage,
}: EmailVerificationPageProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "error">("pending")

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleResendEmail = async () => {
    setIsResending(true)

    // Simulate API call
    setTimeout(() => {
      setIsResending(false)
      setResendCooldown(60) // 60 second cooldown
    }, 1000)
  }

  const handleVerifyEmail = () => {
    // Simulate email verification
    setVerificationStatus("success")
    setTimeout(() => {
      setCurrentPage("login")
    }, 2000)
  }

  if (verificationStatus === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Verified!</h1>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You can now sign in to your account.
            </p>
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-gray-500 mt-4">Redirecting to login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => setCurrentPage("register")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Registration</span>
        </button>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
            <p className="text-gray-600">We've sent a verification link to</p>
            <p className="font-medium text-gray-900 mt-1">{userEmail}</p>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Check your email inbox</li>
                <li>Click the verification link in the email</li>
                <li>Return here to complete your registration</li>
              </ol>
            </div>

            <div className="text-sm text-gray-600">
              <p>Can't find the email? Check your spam folder or try resending.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Mock Verify Button (for demo) */}
            <button
              onClick={handleVerifyEmail}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              ✨ Simulate Email Verification (Demo)
            </button>

            {/* Resend Email Button */}
            <button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Email
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Still having trouble?{" "}
              <button onClick={() => setCurrentPage("contact")} className="text-blue-600 hover:text-blue-500 underline">
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
