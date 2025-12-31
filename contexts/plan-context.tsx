"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useInvoice } from "./invoice-context"
import { api, ApiError } from "@/lib/api"
import { useAuth } from "./auth-context"

interface PlanResponse {
  current_plan: "free" | "unlimited"
}

interface PlanContextType {
  currentPlan: "free" | "unlimited"
  invoicesThisMonth: number
  canCreateInvoice: boolean
  upgradeToPlan: (plan: "free" | "unlimited") => Promise<void>
  monthlyLimit: number
  isLoading: boolean
}

const PlanContext = createContext<PlanContextType | undefined>(undefined)

export function PlanProvider({ children }: { children: ReactNode }) {
  const [currentPlan, setCurrentPlan] = useState<"free" | "unlimited">("free")
  const [isLoading, setIsLoading] = useState(true)
  const { invoices } = useInvoice()
  const { user } = useAuth()

  // Fetch plan from backend
  useEffect(() => {
    const fetchPlan = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const response = await api.get<PlanResponse>("/api/plan")
        if (response.success && response.data) {
          setCurrentPlan(response.data.current_plan)
        }
      } catch (error) {
        console.error("Error fetching plan:", error)
        // If error, default to free plan
        setCurrentPlan("free")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlan()
  }, [user])

  const getInvoicesThisMonth = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.createdAt)
      return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear
    }).length
  }

  const invoicesThisMonth = getInvoicesThisMonth()
  const monthlyLimit = currentPlan === "free" ? 3 : Number.POSITIVE_INFINITY
  const canCreateInvoice = currentPlan === "unlimited" || invoicesThisMonth < monthlyLimit

  const upgradeToPlan = async (plan: "free" | "unlimited") => {
    if (!user) {
      throw new Error("You must be logged in to change your plan")
    }

    try {
      const response = await api.put<PlanResponse>("/api/plan", {
        plan_type: plan,
      })

      if (response.success && response.data) {
        setCurrentPlan(response.data.current_plan)
      } else {
        throw new Error("Failed to update plan")
      }
    } catch (error) {
      console.error("Error updating plan:", error)
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error("Failed to update plan. Please try again.")
    }
  }

  return (
    <PlanContext.Provider
      value={{
        currentPlan,
        invoicesThisMonth,
        canCreateInvoice,
        upgradeToPlan,
        monthlyLimit,
        isLoading,
      }}
    >
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() {
  const context = useContext(PlanContext)
  if (context === undefined) {
    throw new Error("usePlan must be used within a PlanProvider")
  }
  return context
}
