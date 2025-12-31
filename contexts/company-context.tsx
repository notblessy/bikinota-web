"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api, ApiError } from "@/lib/api"
import { useAuth } from "./auth-context"

export interface BankAccount {
  id: string
  bankName: string
  accountName: string
  accountNumber: string
  swiftCode?: string
  routingNumber?: string
  isDefault?: boolean
}

export interface CompanyInfo {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  email: string
  phone: string
  website: string
  logo: string // base64 encoded image
  bankAccounts: BankAccount[]
}

// Backend response types
interface BankAccountResponse {
  id: string
  bank_name: string
  account_name: string
  account_number: string
  swift_code?: string
  routing_number?: string
  is_default: boolean
}

interface CompanyResponse {
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  country: string
  email: string
  phone: string
  website: string
  logo: string
  bank_accounts: BankAccountResponse[]
}

interface CompanyContextType {
  companyInfo: CompanyInfo
  updateCompanyInfo: (info: Partial<CompanyInfo>) => Promise<void>
  uploadLogo: (file: File) => Promise<void>
  removeLogo: () => Promise<void>
  addBankAccount: (account: Omit<BankAccount, "id">) => Promise<void>
  updateBankAccount: (id: string, account: Partial<BankAccount>) => Promise<void>
  deleteBankAccount: (id: string) => Promise<void>
  setDefaultBankAccount: (id: string) => Promise<void>
  isLoading: boolean
}

// Helper function to convert backend response to frontend format
function mapCompanyResponse(response: CompanyResponse): CompanyInfo {
  return {
    name: response.name || "",
    address: response.address || "",
    city: response.city || "",
    state: response.state || "",
    zipCode: response.zip_code || "",
    country: response.country || "",
    email: response.email || "",
    phone: response.phone || "",
    website: response.website || "",
    logo: response.logo || "",
    bankAccounts: (response.bank_accounts || []).map((ba) => ({
      id: ba.id,
      bankName: ba.bank_name,
      accountName: ba.account_name,
      accountNumber: ba.account_number,
      swiftCode: ba.swift_code,
      routingNumber: ba.routing_number,
      isDefault: ba.is_default,
    })),
  }
}

const defaultCompanyInfo: CompanyInfo = {
  name: "Your Company Name",
  address: "123 Business Street",
  city: "Business City",
  state: "State",
  zipCode: "12345",
  country: "Country",
  email: "contact@yourcompany.com",
  phone: "+1 (555) 123-4567",
  website: "www.yourcompany.com",
  logo: "",
  bankAccounts: [],
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Fetch company from backend
  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const response = await api.get<CompanyResponse>("/api/company")
        if (response.success && response.data) {
          const mappedCompany = mapCompanyResponse(response.data)
          setCompanyInfo(mappedCompany)
        } else {
          // If no company exists, use default
          setCompanyInfo(defaultCompanyInfo)
        }
      } catch (error) {
        console.error("Error fetching company:", error)
        // On error, use default
        setCompanyInfo(defaultCompanyInfo)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompany()
  }, [user])

  const updateCompanyInfo = async (updates: Partial<CompanyInfo>) => {
    if (!user) {
      throw new Error("You must be logged in to update company information")
    }

    try {
      // Convert frontend format to backend format
      const backendUpdate: any = {}
      if (updates.name !== undefined) backendUpdate.name = updates.name
      if (updates.address !== undefined) backendUpdate.address = updates.address
      if (updates.city !== undefined) backendUpdate.city = updates.city
      if (updates.state !== undefined) backendUpdate.state = updates.state
      if (updates.zipCode !== undefined) backendUpdate.zip_code = updates.zipCode
      if (updates.country !== undefined) backendUpdate.country = updates.country
      if (updates.email !== undefined) backendUpdate.email = updates.email
      if (updates.phone !== undefined) backendUpdate.phone = updates.phone
      if (updates.website !== undefined) backendUpdate.website = updates.website
      if (updates.logo !== undefined) backendUpdate.logo = updates.logo

      const response = await api.put<CompanyResponse>("/api/company", backendUpdate)
      if (response.success && response.data) {
        const mappedCompany = mapCompanyResponse(response.data)
        setCompanyInfo(mappedCompany)
      } else {
        throw new Error("Failed to update company")
      }
    } catch (error) {
      console.error("Error updating company:", error)
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error("Failed to update company. Please try again.")
    }
  }

  const uploadLogo = async (file: File): Promise<void> => {
    if (!user) {
      throw new Error("You must be logged in to upload logo")
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("Please select an image file")
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      throw new Error("Image size should be less than 5MB")
    }

    try {
      const formData = new FormData()
      formData.append("logo", file)

      const token = localStorage.getItem("bikinota_token")
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

      const response = await fetch(`${API_BASE_URL}/api/company/logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload logo")
      }

      if (data.success && data.data) {
        const mappedCompany = mapCompanyResponse(data.data)
        setCompanyInfo(mappedCompany)
      } else {
        throw new Error("Failed to upload logo")
      }
    } catch (error) {
      console.error("Error uploading logo:", error)
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error(error instanceof Error ? error.message : "Failed to upload logo. Please try again.")
    }
  }

  const removeLogo = async () => {
    await updateCompanyInfo({ logo: "" })
  }

  const addBankAccount = async (account: Omit<BankAccount, "id">) => {
    if (!user) {
      throw new Error("You must be logged in to add bank accounts")
    }

    try {
      // Convert frontend format to backend format
      const backendAccount: any = {
        bank_name: account.bankName,
        account_name: account.accountName,
        account_number: account.accountNumber,
      }
      if (account.swiftCode) backendAccount.swift_code = account.swiftCode
      if (account.routingNumber) backendAccount.routing_number = account.routingNumber

      const response = await api.post<BankAccountResponse>("/api/company/bank-accounts", backendAccount)
      if (response.success && response.data) {
        // Refresh company to get updated bank accounts
        const companyResponse = await api.get<CompanyResponse>("/api/company")
        if (companyResponse.success && companyResponse.data) {
          const mappedCompany = mapCompanyResponse(companyResponse.data)
          setCompanyInfo(mappedCompany)
        }
      } else {
        throw new Error("Failed to add bank account")
      }
    } catch (error) {
      console.error("Error adding bank account:", error)
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error("Failed to add bank account. Please try again.")
    }
  }

  const updateBankAccount = async (id: string, updates: Partial<BankAccount>) => {
    if (!user) {
      throw new Error("You must be logged in to update bank accounts")
    }

    try {
      // Convert frontend format to backend format
      const backendUpdate: any = {}
      if (updates.bankName !== undefined) backendUpdate.bank_name = updates.bankName
      if (updates.accountName !== undefined) backendUpdate.account_name = updates.accountName
      if (updates.accountNumber !== undefined) backendUpdate.account_number = updates.accountNumber
      if (updates.swiftCode !== undefined) backendUpdate.swift_code = updates.swiftCode
      if (updates.routingNumber !== undefined) backendUpdate.routing_number = updates.routingNumber

      const response = await api.put<BankAccountResponse>(`/api/company/bank-accounts/${id}`, backendUpdate)
      if (response.success && response.data) {
        // Refresh company to get updated bank accounts
        const companyResponse = await api.get<CompanyResponse>("/api/company")
        if (companyResponse.success && companyResponse.data) {
          const mappedCompany = mapCompanyResponse(companyResponse.data)
          setCompanyInfo(mappedCompany)
        }
      } else {
        throw new Error("Failed to update bank account")
      }
    } catch (error) {
      console.error("Error updating bank account:", error)
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error("Failed to update bank account. Please try again.")
    }
  }

  const deleteBankAccount = async (id: string) => {
    if (!user) {
      throw new Error("You must be logged in to delete bank accounts")
    }

    try {
      const response = await api.delete(`/api/company/bank-accounts/${id}`)
      if (response.success) {
        // Refresh company to get updated bank accounts
        const companyResponse = await api.get<CompanyResponse>("/api/company")
        if (companyResponse.success && companyResponse.data) {
          const mappedCompany = mapCompanyResponse(companyResponse.data)
          setCompanyInfo(mappedCompany)
        }
      } else {
        throw new Error("Failed to delete bank account")
      }
    } catch (error) {
      console.error("Error deleting bank account:", error)
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error("Failed to delete bank account. Please try again.")
    }
  }

  const setDefaultBankAccount = async (id: string) => {
    if (!user) {
      throw new Error("You must be logged in to set default bank account")
    }

    try {
      const response = await api.put<CompanyResponse>(`/api/company/bank-accounts/${id}/default`, {})
      if (response.success && response.data) {
        const mappedCompany = mapCompanyResponse(response.data)
        setCompanyInfo(mappedCompany)
      } else {
        throw new Error("Failed to set default bank account")
      }
    } catch (error) {
      console.error("Error setting default bank account:", error)
      if (error instanceof ApiError) {
        throw error
      }
      throw new Error("Failed to set default bank account. Please try again.")
    }
  }

  return (
    <CompanyContext.Provider
      value={{
        companyInfo,
        updateCompanyInfo,
        uploadLogo,
        removeLogo,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        setDefaultBankAccount,
        isLoading,
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider")
  }
  return context
}
