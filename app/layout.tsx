import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { InvoiceProvider } from "@/contexts/invoice-context"
import { PlanProvider } from "@/contexts/plan-context"
import { CompanyProvider } from "@/contexts/company-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bikinota - Professional Invoice Generator",
  description: "Create, manage, and export professional invoices with ease",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CompanyProvider>
            <InvoiceProvider>
              <PlanProvider>
                {children}
                <Toaster />
              </PlanProvider>
            </InvoiceProvider>
          </CompanyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
