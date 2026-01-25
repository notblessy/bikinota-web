"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProtectedRoute from "@/components/protected-route"
import Navbar from "@/components/navbar"
import { usePlan } from "@/contexts/plan-context"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Check, Crown, Zap } from "lucide-react"

export default function BillingPage() {
  const { currentPlan, upgradeToPlan, invoicesThisMonth, monthlyLimit } = usePlan()
  const { toast } = useToast()
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async (plan: "free" | "unlimited") => {
    // For downgrading to free, we can do it directly
    if (plan === "free") {
      setIsUpgrading(true)
      try {
        await upgradeToPlan(plan)
        toast({
          title: "Downgraded to free plan",
          description: "You are now on the free plan with 3 invoices per month.",
        })
      } catch (error: any) {
        toast({
          title: "Failed to update plan",
          description: error?.message || "An error occurred while updating your plan. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsUpgrading(false)
      }
      return
    }

    // For upgrading to unlimited, redirect to Polar checkout
    setIsUpgrading(true)
    try {
      const response = await api.get<string>("/api/payment/checkout-link")
      if (response.success && response.data) {
        // Redirect to Polar checkout
        window.location.href = response.data
      } else {
        throw new Error("Failed to create checkout link")
      }
    } catch (error: any) {
    toast({
        title: "Failed to start checkout",
        description: error?.message || "An error occurred while starting checkout. Please try again.",
        variant: "destructive",
      })
      setIsUpgrading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-rose-50/30 to-pink-50/30">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Billing & Plans</h1>
            <p className="text-gray-600 mt-1">Manage your subscription and billing information</p>
          </div>

          {/* Current Plan Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                Current Plan
                {currentPlan === "unlimited" && <Crown className="h-5 w-5 text-rose-500 ml-2" />}
              </CardTitle>
              <CardDescription>Your current subscription details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={currentPlan === "unlimited" ? "default" : "secondary"} className="text-sm">
                      {currentPlan === "unlimited" ? "Unlimited Plan" : "Free Plan"}
                    </Badge>
                    {currentPlan === "free" && (
                      <span className="text-sm text-gray-600">
                        {invoicesThisMonth}/{monthlyLimit} invoices used this month
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">
                    {currentPlan === "unlimited"
                      ? "Unlimited invoices and premium features"
                      : "Limited to 3 invoices per month"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {currentPlan === "unlimited" ? "$25" : "$0"}
                    <span className="text-sm font-normal text-gray-600">/month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Plans */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className={currentPlan === "free" ? "border-blue-500 border-2" : ""}>
              {currentPlan === "free" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Current Plan</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-3xl font-bold">
                  $0<span className="text-lg font-normal text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />3 invoices per month
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    PDF export
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Basic templates
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Email support
                  </li>
                </ul>
                {currentPlan === "unlimited" ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleUpgrade("free")}
                    disabled={isUpgrading}
                  >
                    {isUpgrading ? "Updating..." : "Downgrade to Free"}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className={currentPlan === "unlimited" ? "border-blue-500 border-2" : ""}>
              {currentPlan === "unlimited" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Current Plan</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  Unlimited
                  <Crown className="h-6 w-6 text-yellow-500 ml-2" />
                </CardTitle>
                <CardDescription>For growing businesses</CardDescription>
                <div className="text-3xl font-bold">
                  $25<span className="text-lg font-normal text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Unlimited invoices
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    PDF export
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Premium templates
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    Advanced reporting
                  </li>
                </ul>
                {currentPlan === "free" ? (
                  <Button
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => handleUpgrade("unlimited")}
                    disabled={isUpgrading}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {isUpgrading ? "Upgrading..." : "Upgrade Now"}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Billing Information */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your subscription and payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentPlan === "unlimited" && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Active Subscription</h4>
                    <p className="text-green-800 text-sm">
                      Your unlimited plan is active. You have access to all premium features.
                    </p>
                  </div>
                )}

                {currentPlan === "free" && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Upgrade to Unlimited</h4>
                    <p className="text-blue-800 text-sm">
                      Click "Upgrade Now" to start your unlimited subscription. You'll be redirected to a secure payment page.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
