"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api, ApiError } from "@/lib/api"

interface User {
  id: number
  email: string
  name: string
}

interface AuthResponse {
  token: string
  type: string
  user: User
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const initAuth = async () => {
      const savedUser = localStorage.getItem("bikinota_user")
      const savedToken = localStorage.getItem("bikinota_token")

      if (savedUser && savedToken) {
        try {
          // Verify token is still valid by making a request
          // For now, just restore from localStorage
          // In production, you might want to verify with a /me endpoint
          setUser(JSON.parse(savedUser))
        } catch (error) {
          // Token might be invalid, clear storage
          localStorage.removeItem("bikinota_user")
          localStorage.removeItem("bikinota_token")
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post<AuthResponse>("/api/auth/login", {
        email,
        password,
      })

      if (response.success && response.data) {
        const { token, user: userData } = response.data
        setUser(userData)
        localStorage.setItem("bikinota_token", token)
        localStorage.setItem("bikinota_user", JSON.stringify(userData))
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      if (error instanceof ApiError) {
        throw error
      }
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await api.post<AuthResponse>("/api/auth/register", {
        email,
        password,
        name,
      })

      if (response.success && response.data) {
        const { token, user: userData } = response.data
        setUser(userData)
        localStorage.setItem("bikinota_token", token)
        localStorage.setItem("bikinota_user", JSON.stringify(userData))
        return true
      }
      return false
    } catch (error) {
      console.error("Register error:", error)
      if (error instanceof ApiError) {
        throw error
      }
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("bikinota_user")
    localStorage.removeItem("bikinota_token")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
