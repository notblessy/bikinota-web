import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <FileText className="h-16 w-16 text-rose-600" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="flex items-center bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
