"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { BottomNavigation } from "@/components/bottom-navigation"

// Create context
type BottomNavigationContextType = {
  hideNavigation: () => void
  showNavigation: () => void
}

const BottomNavigationContext = createContext<BottomNavigationContextType | undefined>(undefined)

// Provider component
export function BottomNavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigationHidden, setIsNavigationHidden] = useState(false)

  const hideNavigation = () => setIsNavigationHidden(true)
  const showNavigation = () => setIsNavigationHidden(false)

  return (
    <BottomNavigationContext.Provider value={{ hideNavigation, showNavigation }}>
      {children}
      <BottomNavigation hidden={isNavigationHidden} />
    </BottomNavigationContext.Provider>
  )
}

// Hook for using the context
export function useBottomNavigation() {
  const context = useContext(BottomNavigationContext)
  if (context === undefined) {
    throw new Error("useBottomNavigation must be used within a BottomNavigationProvider")
  }
  return context
}

