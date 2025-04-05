import { computeMovement } from "@/dto";
import { db } from "./index";
import { assets, assetBalances, transactions, users } from "./schema";
import { eq, sql } from "drizzle-orm";

interface Player {
  id: string;
  name: string;
  imageUrl: string;
}

interface Activity {
  playerId: string;
  type: "buy" | "sell";
  shares: number;
  amount: number;
  currentPrice: number;
  timestamp: string;
}

// Sample players data
const players: Player[] = [
  {
    id: "1",
    name: "Lionel Messi",
    imageUrl: "/messi.webp",
  },
  {
    id: "2",
    name: "Cristiano Ronaldo",
    imageUrl: "/cristiano.webp",
  },
  {
    id: "3",
    name: "Kylian Mbappé",
    imageUrl: "/mbappe.webp",
  },
  {
    id: "4",
    name: "Erling Haaland",
    imageUrl: "/haaland.webp",
  },
  {
    id: "5",
    name: "Jude Bellingham",
    imageUrl: "/bellingham.webp",
  },
  {
    id: "6",
    name: "Kevin De Bruyne",
    imageUrl: "/bruyne.webp",
  },
  {
    id: "7",
    name: "Mohamed Salah",
    imageUrl: "/salah.webp",
  },
  {
    id: "8",
    name: "Vinicius Junior",
    imageUrl: "/vinicius.webp",
  },
];

// Initial prices for activity generation
const initialPrices = {
  "1": 120.5, // Messi
  "2": 115.75, // Ronaldo
  "3": 180.25, // Mbappé
  "4": 175.5, // Haaland
  "5": 145.25, // Bellingham
  "6": 135.8, // De Bruyne
  "7": 140.6, // Salah
  "8": 165.3, // Vinicius
} as const;

// Generate historical activities for a player
function generatePlayerActivities(
  playerId: string,
  startPrice: number
): Activity[] {
  const now = new Date();
  const activities: Activity[] = [];

  // Start price at the given value and gradually change with fluctuations
  let currentPrice = startPrice;

  // Last year (200 activities, every ~1.82 days)
  for (let i = 0; i < 200; i++) {
    const daysAgo = 365 - i * 1.82;
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const type = Math.random() > 0.3 ? "buy" : "sell";
    const amount = Number.parseFloat((Math.random() * 10 + 2).toFixed(2));

    const { shares, newPrice } = computeMovement({
      type,
      amount,
      amountType: "cash",
      latestPrice: currentPrice,
    });

    currentPrice = newPrice;

    activities.push({
      playerId,
      type,
      shares,
      amount,
      currentPrice,
      timestamp: date.toISOString(),
    });
  }

  // Last month (15 activities, every ~2 days)
  /*  for (let i = 0; i < 15; i++) {
    const daysAgo = 30 - i * 2;
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const type = Math.random() > 0.3 ? "buy" : "sell";
    const amount = Number.parseFloat((Math.random() * 10 + 2).toFixed(2));

    // Calculate new price based on the formula
    const buyingAmount = type === "buy" ? amount : 0;
    const sellingAmount = type === "sell" ? amount : 0;

    const newPrice =
      currentPrice +
      (VOLATILITY_FACTOR * (buyingAmount - sellingAmount)) / currentPrice;
    currentPrice = Number.parseFloat(newPrice.toFixed(2));

    const shares = Number.parseFloat((amount / currentPrice).toFixed(2));

    activities.push({
      playerId,
      type,
      shares,
      amount,
      currentPrice,
      timestamp: date.toISOString(),
    });
  }

  // Last week (10 activities, every ~17 hours)
  for (let i = 0; i < 10; i++) {
    const daysAgo = 7 - i * 0.7;
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const type = Math.random() > 0.3 ? "buy" : "sell";
    const amount = Number.parseFloat((Math.random() * 10 + 2).toFixed(2));

    const buyingAmount = type === "buy" ? amount : 0;
    const sellingAmount = type === "sell" ? amount : 0;

    const newPrice =
      currentPrice +
      (VOLATILITY_FACTOR * (buyingAmount - sellingAmount)) / currentPrice;
    currentPrice = Number.parseFloat(newPrice.toFixed(2));

    const shares = Number.parseFloat((amount / currentPrice).toFixed(2));

    activities.push({
      playerId,
      type,
      shares,
      amount,
      currentPrice,
      timestamp: date.toISOString(),
    });
  }

  // Last 24 hours (8 activities, every ~3 hours)
  for (let i = 0; i < 8; i++) {
    const hoursAgo = 24 - i * 3;
    const date = new Date(now);
    date.setHours(date.getHours() - hoursAgo);

    const type = Math.random() > 0.3 ? "buy" : "sell";
    const amount = Number.parseFloat((Math.random() * 10 + 2).toFixed(2));

    const buyingAmount = type === "buy" ? amount : 0;
    const sellingAmount = type === "sell" ? amount : 0;

    const newPrice =
      currentPrice +
      (VOLATILITY_FACTOR * (buyingAmount - sellingAmount)) / currentPrice;
    currentPrice = Number.parseFloat(newPrice.toFixed(2));

    const shares = Number.parseFloat((amount / currentPrice).toFixed(2));

    activities.push({
      playerId,
      type,
      shares,
      amount,
      currentPrice,
      timestamp: date.toISOString(),
    });
  } */

  // Sort by timestamp (newest first)
  return activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// Generate all activities
function generateAllActivities(): Activity[] {
  let allActivities: Activity[] = [];

  players.forEach((player) => {
    // Generate activities with a starting price that's about 70% of initial price
    const startingPrice =
      initialPrices[player.id as keyof typeof initialPrices] * 0.7;
    const playerActivities = generatePlayerActivities(player.id, startingPrice);
    allActivities = [...allActivities, ...playerActivities];
  });

  return allActivities;
}

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.batch([
    db.delete(transactions),
    db.delete(assetBalances),
    db.delete(assets),
    db.delete(users),
  ]);

  const seedUsers = [
    { id: "1", name: "Marcel", cash: 1000 },
    { name: "John Smith", cash: 10000 },
    { name: "Emma Johnson", cash: 15000 },
    { name: "Michael Brown", cash: 12000 },
    { name: "Sarah Davis", cash: 20000 },
    { name: "David Wilson", cash: 18000 },
    { name: "Lisa Chen", cash: 25000 },
    { name: "Robert Taylor", cash: 13000 },
    { name: "Jennifer Lee", cash: 16000 },
  ];

  console.log("👥 Creating users...");
  const createdUsers = await db.insert(users).values(seedUsers).returning();

  if (createdUsers.length === 0) {
    throw new Error("Failed to create users");
  }

  // Create assets from players
  console.log("💰 Creating assets...");
  const seedAssets = players.map((player) => ({
    id: player.id,
    name: player.name,
    image: player.imageUrl,
    defaultPrice: initialPrices[player.id as keyof typeof initialPrices],
  }));

  const createdAssets = await db.insert(assets).values(seedAssets).returning();

  // Create transactions from activities
  console.log("📝 Creating transactions...");
  const allActivities = generateAllActivities();
  const seedTransactions = allActivities.map((activity) => {
    // Get a random index within bounds
    const randomIndex = Math.floor(Math.random() * createdUsers.length);
    // This is safe because we checked length > 0 above
    const randomUser = createdUsers[randomIndex]!;

    return {
      userId: randomUser.id,
      assetId: activity.playerId,
      type: activity.type,
      shares: activity.shares,
      cashAmount: activity.amount,
      latestPrice: activity.currentPrice,
      createdAt: new Date(activity.timestamp),
      updatedAt: new Date(activity.timestamp),
    };
  });

  await db.insert(transactions).values(seedTransactions);

  // Calculate and create asset balances
  console.log("⚖️ Calculating balances...");
  for (const user of createdUsers) {
    for (const asset of createdAssets) {
      // Get all transactions for this user and asset
      const userTransactions = await db
        .select({
          totalShares: sql<number>`sum(case when type = 'buy' then shares else -shares end)`,
        })
        .from(transactions)
        .where(sql`user_id = ${user.id} and asset_id = ${asset.id}`)
        .groupBy(sql`user_id, asset_id`);

      const totalShares = userTransactions[0]?.totalShares ?? 0;

      // Only create balance if user has shares
      if (totalShares > 0) {
        await db.insert(assetBalances).values({
          userId: user.id,
          assetId: asset.id,
          shares: totalShares,
          updatedAt: new Date(),
        });
      }
    }
  }

  // Update users' cash based on their transactions
  console.log("💵 Updating user cash...");
  for (const user of createdUsers) {
    const userTransactions = await db
      .select({
        totalSpent: sql<number>`sum(case when type = 'buy' then shares * latest_price else -shares * latest_price end)`,
      })
      .from(transactions)
      .where(sql`user_id = ${user.id}`)
      .groupBy(sql`user_id`);

    const totalSpent = userTransactions[0]?.totalSpent ?? 0;

    await db
      .update(users)
      .set({ cash: user.cash - totalSpent })
      .where(eq(users.id, user.id));
  }

  console.log("✅ Seeding complete!");
}

// Run the seed function
seed().catch(console.error);
