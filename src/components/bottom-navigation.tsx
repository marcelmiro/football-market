"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Briefcase } from "lucide-react"

interface BottomNavigationProps {
  hidden?: boolean
}

export function BottomNavigation({ hidden = false }: BottomNavigationProps) {
  const pathname = usePathname()

  if (hidden) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="container max-w-md mx-auto px-4">
        <div className="flex justify-around py-3">
          <Link
            href="/"
            className={`flex flex-col items-center ${pathname === "/" ? "text-green-600" : "text-gray-500"}`}
          >
            <Home className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </Link>

          <Link
            href="/portfolio"
            className={`flex flex-col items-center ${pathname === "/portfolio" ? "text-green-600" : "text-gray-500"}`}
          >
            <Briefcase className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Portfolio</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

