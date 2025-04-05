import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UserState {
  cashBalance: number
  playerHoldings: Record<string, number>
  updateCashBalance: (newBalance: number) => void
  updatePlayerHoldings: (playerId: string, shares: number) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Start with 1000€ cash balance
      cashBalance: 1000,
      // Record of player ID to number of shares held
      playerHoldings: {},

      // Update cash balance
      updateCashBalance: (newBalance) => set({ cashBalance: newBalance }),

      // Update player holdings
      updatePlayerHoldings: (playerId, shares) =>
        set((state) => ({
          playerHoldings: {
            ...state.playerHoldings,
            [playerId]: shares,
          },
        })),
    }),
    {
      name: "football-market-user",
    },
  ),
)

