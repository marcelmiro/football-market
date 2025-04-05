import Image from "next/image";
import Link from "next/link";

import PlayerClient from "./client";
import type { PageProps } from "@/utils";
import { db } from "@/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { UserBalance } from "@/components/user-balance";
import { notFound } from "next/navigation";

type Props = PageProps<{ id: string }>;

export default async function PlayerPage({ params }: Props) {
  const id = (await params).id;

  const [user, asset] = await db.batch([
    db.query.users.findFirst({
      where: (t, { eq }) => eq(t.id, "1"),
      columns: { cash: true },
    }),
    db.query.assets.findFirst({
      where: (t, { eq }) => eq(t.id, id),
      columns: { name: true, image: true, defaultPrice: true },
      with: {
        transactions: {
          orderBy: (t, { desc }) => desc(t.createdAt),
          columns: {
            type: true,
            shares: true,
            cashAmount: true,
            latestPrice: true,
            createdAt: true,
          },
          with: {
            user: {
              columns: { name: true },
            },
          },
        },
        balances: {
          limit: 1,
          where: (t, { eq }) => eq(t.userId, "1"),
          columns: { shares: true },
        },
      },
    }),
  ]);

  if (!asset) notFound();
  if (!user) return "Not logged in";

  return (
    <main className="container max-w-md mx-auto px-4 py-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <UserBalance cash={user.cash} />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative h-20 w-20 rounded-full overflow-hidden bg-muted">
          <Image
            src={asset.image}
            alt={asset.name}
            className="object-cover"
            fill
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{asset.name}</h1>
        </div>
      </div>

      <PlayerClient
        id={id}
        name={asset.name}
        cashAmount={user.cash}
        latestPrice={asset.transactions[0]?.latestPrice || asset.defaultPrice}
        currentShares={asset.balances[0]?.shares ?? undefined}
        transactions={asset.transactions}
      />
    </main>
  );
}
