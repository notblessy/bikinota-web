"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ProtectedRoute from "@/components/protected-route"
import Navbar from "@/components/navbar"
import { usePlan } from "@/contexts/plan-context"
import { CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const checkoutId = searchParams.get("checkout_id")
  const { currentPlan, isLoading: planLoading } = usePlan()
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState<"success" | "pending" | "error">("pending")

  useEffect(() => {
    // The webhook will handle the actual plan update
    // We just need to wait a bit and then check if the plan was updated
    const verifyPayment = async () => {
      if (!checkoutId) {
        setVerificationStatus("error")
        setIsVerifying(false)
        return
      }

      // Wait a few seconds for webhook to process
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Check if plan was updated (the plan context will refresh automatically)
      // If after 10 seconds the plan is still not unlimited, show pending message
      setTimeout(() => {
        setIsVerifying(false)
        if (currentPlan === "unlimited") {
          setVerificationStatus("success")
        } else {
          setVerificationStatus("pending")
        }
      }, 7000)
    }

    verifyPayment()
  }, [checkoutId, currentPlan])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-rose-50/30 to-pink-50/30">
        <Navbar />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              {isVerifying ? (
                <>
                  <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
                  <CardTitle className="text-2xl">Processing Payment</CardTitle>
                  <CardDescription>
                    Please wait while we verify your payment and activate your subscription...
                  </CardDescription>
                </>
              ) : verificationStatus === "success" ? (
                <>
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
                  <CardDescription>
                    Your subscription has been activated. You now have unlimited access to all features.
                  </CardDescription>
                </>
              ) : verificationStatus === "pending" ? (
                <>
                  <Loader2 className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-spin" />
                  <CardTitle className="text-2xl text-yellow-600">Payment Received</CardTitle>
                  <CardDescription>
                    Your payment was received successfully. We're processing your subscription activation.
                    This may take a few moments. Your plan will be updated automatically.
                  </CardDescription>
                </>
              ) : (
                <>
                  <CardTitle className="text-2xl text-red-600">Verification Error</CardTitle>
                  <CardDescription>
                    There was an issue verifying your payment. Please contact support if the problem persists.
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {checkoutId && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Checkout ID:</span> {checkoutId}
                  </p>
                </div>
              )}

              {verificationStatus === "success" && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    Your unlimited plan is now active! You can create unlimited invoices and access all premium features.
                  </p>
                </div>
              )}

              {verificationStatus === "pending" && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    If your plan doesn't update within a few minutes, please refresh this page or contact support.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                >
                  Go to Dashboard
                </Button>
                <Link href="/billing" className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Billing
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
