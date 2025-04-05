import Image from "next/image";
import Link from "next/link";
import { ArrowUp, ArrowDown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { UserBalance } from "@/components/user-balance";
import { db } from "@/db";
import { PlayerCard } from "@/components/player-card";

export default async function PortfolioPage() {
  const [user, balances] = await db.batch([
    db.query.users.findFirst({
      where: (t, { eq }) => eq(t.id, "1"),
      columns: { cash: true },
    }),
    db.query.assetBalances.findMany({
      where: (t, { eq }) => eq(t.userId, "1"),
      columns: { shares: true },
      with: {
        asset: {
          columns: { id: true, name: true, image: true },
          with: {
            transactions: {
              limit: 1,
              orderBy: (t, { desc }) => desc(t.createdAt),
              columns: { latestPrice: true },
            },
          },
        },
      },
    }),
  ]);

  if (!user) return "Not logged in";

  const totalValue = balances.reduce(
    (acc, balance) =>
      acc + balance.shares * (balance.asset.transactions[0]?.latestPrice ?? 0),
    0
  );

  return (
    <main className="container max-w-md mx-auto px-4 py-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <UserBalance cash={user.cash} />
      </div>

      {/* Portfolio Summary */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Portfolio Value</p>
              <p className="text-2xl font-bold">€{totalValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cash Balance</p>
              <p className="text-2xl font-bold">€{user.cash.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holdings */}
      <h2 className="text-lg font-semibold mb-4">Your Holdings</h2>

      {balances.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>You don't have any holdings yet.</p>
          <p className="mt-2">Start buying players to build your portfolio!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {balances.map((item) => (
            <PlayerCard
              key={item.asset.id}
              id={item.asset.id}
              name={item.asset.name}
              price={item.asset.transactions[0]?.latestPrice ?? 0}
              imageUrl={item.asset.image}
              shares={item.shares}
            />
          ))}
        </div>
      )}
    </main>
  );
}
