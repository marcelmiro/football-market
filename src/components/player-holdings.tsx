"use client"

import { useUserStore } from "@/store/user-store"

interface PlayerHoldingsProps {
  playerId: string
  currentPrice: number
}

export function PlayerHoldings({ playerId, currentPrice }: PlayerHoldingsProps) {
  const { playerHoldings } = useUserStore()

  const shares = playerHoldings[playerId] || 0
  const value = shares * currentPrice

  if (shares <= 0) {
    return null
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-medium text-blue-800">Your Position</h3>
        <p className="font-medium text-blue-700">€{value.toFixed(2)}</p>
      </div>
    </div>
  )
}

