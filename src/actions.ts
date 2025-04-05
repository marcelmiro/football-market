"use server";

import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "./db";
import { users, assetBalances, transactions } from "./db/schema";
import { redirect } from "next/navigation";
import { computeMovement } from "./dto";
import { sqlNonNegative } from "./utils";
import { revalidatePath } from "next/cache";

export async function buy(_prevState: any, formData: FormData) {
  const validatedFields = await buySchema.safeParseAsync({
    assetId: formData.get("assetId"),
    cashAmount: formData.get("cashAmount"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as
        | Record<string, string>
        | undefined,
    };
  }

  const [user, asset] = await db.batch([
    db.query.users.findFirst({
      where: (t, { eq }) => eq(t.id, "1"),
      columns: { cash: true },
    }),
    db.query.assets.findFirst({
      where: (t, { eq }) => eq(t.id, validatedFields.data.assetId),
      columns: { id: true, defaultPrice: true },
      with: {
        transactions: {
          limit: 1,
          orderBy: (t, { desc }) => desc(t.createdAt),
          columns: { latestPrice: true },
        },
      },
    }),
  ]);

  if (!user) redirect("/login");
  if (!asset) return { error: "Asset not found" };

  if (user.cash < validatedFields.data.cashAmount) {
    return { error: "Insufficient cash" };
  }

  const latestPrice = asset.transactions[0]?.latestPrice || asset.defaultPrice;

  const { cashAmount, shares, newPrice } = computeMovement({
    type: "buy",
    amountType: "cash",
    amount: validatedFields.data.cashAmount,
    latestPrice,
  });

  await db.batch([
    db
      .update(users)
      .set({ cash: sqlNonNegative(sql`${users.cash} - ${cashAmount}`) })
      .where(eq(users.id, "1")),
    db
      .insert(assetBalances)
      .values({
        userId: "1",
        assetId: asset.id,
        shares: shares,
      })
      .onConflictDoUpdate({
        target: [assetBalances.userId, assetBalances.assetId],
        set: {
          shares: sql`${assetBalances.shares} + ${shares}`,
        },
      }),
    db.insert(transactions).values({
      userId: "1",
      assetId: asset.id,
      type: "buy",
      cashAmount: cashAmount,
      shares: shares,
      latestPrice: newPrice,
    }),
  ]);

  revalidatePath("/", "layout");
  return { success: true };
}

export async function sell(_prevState: any, formData: FormData) {
  const validatedFields = await sellSchema.safeParseAsync({
    assetId: formData.get("assetId"),
    shares: formData.get("shares"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as
        | Record<string, string>
        | undefined,
    };
  }

  const [user, asset] = await db.batch([
    db.query.users.findFirst({
      where: (t, { eq }) => eq(t.id, "1"),
      columns: { cash: true },
      with: {
        assetBalances: {
          where: (t, { eq }) => eq(t.assetId, validatedFields.data.assetId),
          columns: { shares: true },
        },
      },
    }),
    db.query.assets.findFirst({
      where: (t, { eq }) => eq(t.id, validatedFields.data.assetId),
      columns: { id: true, defaultPrice: true },
      with: {
        transactions: {
          limit: 1,
          orderBy: (t, { desc }) => desc(t.createdAt),
          columns: { latestPrice: true },
        },
      },
    }),
  ]);

  if (!user) redirect("/login");
  if (!asset) return { error: "Asset not found" };

  const currentShares = user.assetBalances[0]?.shares ?? 0;

  if (!currentShares || currentShares < validatedFields.data.shares) {
    return { error: "Insufficient shares" };
  }

  const latestPrice = asset.transactions[0]?.latestPrice || asset.defaultPrice;

  const { cashAmount, shares, newPrice } = computeMovement({
    type: "sell",
    amountType: "shares",
    amount: validatedFields.data.shares,
    latestPrice,
  });

  await db.batch([
    db
      .update(users)
      .set({ cash: sql`${users.cash} + ${cashAmount}` })
      .where(eq(users.id, "1")),
    db
      .update(assetBalances)
      .set({ shares: sqlNonNegative(sql`${assetBalances.shares} - ${shares}`) })
      .where(
        and(eq(assetBalances.userId, "1"), eq(assetBalances.assetId, asset.id))
      ),
    db.insert(transactions).values({
      userId: "1",
      assetId: asset.id,
      type: "sell",
      cashAmount: cashAmount,
      shares: shares,
      latestPrice: newPrice,
    }),
  ]);

  revalidatePath("/", "layout");
  return { success: true };
}

const buySchema = z.object({
  assetId: z.string().min(1),
  cashAmount: z.coerce.number().gt(0),
});

const sellSchema = z.object({
  assetId: z.string().min(1),
  shares: z.coerce.number().gt(0),
});
