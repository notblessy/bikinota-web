import type React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface EnhancedCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glass?: boolean
}

export function EnhancedCard({ children, className, hover = false, glass = false }: EnhancedCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-300",
        hover && "hover:shadow-xl hover:-translate-y-1",
        glass && "bg-white/80 backdrop-blur-sm border-white/20",
        className,
      )}
    >
      {children}
    </Card>
  )
}
