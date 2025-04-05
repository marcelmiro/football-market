import { UserBalance } from "@/components/user-balance";
import { db } from "@/db";
import AssetList from "./asset-list";

export default async function Home() {
  const [user, assets] = await db.batch([
    db.query.users.findFirst({
      where: (t, { eq }) => eq(t.id, "1"),
      columns: { cash: true },
    }),
    db.query.assets.findMany({
      columns: { id: true, name: true, image: true, defaultPrice: true },
      with: {
        transactions: {
          limit: 1,
          orderBy: (t, { desc }) => desc(t.createdAt),
          columns: { latestPrice: true },
        },
      },
    }),
  ]);

  if (!user) return "Not logged in";

  return (
    <main className="container max-w-md mx-auto px-4 py-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">La Bandita Market</h1>
        <UserBalance cash={user.cash} />
      </div>

      <AssetList
        assets={assets.map((asset) => ({
          id: asset.id,
          name: asset.name,
          image: asset.image,
          latestPrice: asset.transactions[0]?.latestPrice || asset.defaultPrice,
        }))}
      />
    </main>
  );
}
