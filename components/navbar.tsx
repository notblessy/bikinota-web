"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { usePlan } from "@/contexts/plan-context";
import {
  User,
  LogOut,
  CreditCard,
  Crown,
  Building2,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { currentPlan, invoicesThisMonth, monthlyLimit } = usePlan();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center">
            <div className="bg-white rounded-xl border border-primary p-2">
              <Image
                src="/logo.png"
                alt="Bikinota Logo"
                width={32}
                height={32}
                className="h-6 w-6"
              />
            </div>
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              bikinota
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Plan Status */}
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              {currentPlan === "unlimited" ? (
                <div className="flex items-center text-yellow-600">
                  <Crown className="h-4 w-4 mr-1 text-rose-500" />
                  <span className="font-medium">Unlimited</span>
                </div>
              ) : (
                <div className="text-gray-600">
                  <span className="font-medium">
                    {invoicesThisMonth}/{monthlyLimit}
                  </span>{" "}
                  invoices used
                </div>
              )}
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/company-settings" className="flex items-center">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing" className="flex items-center">
                    Billing & Plans
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
