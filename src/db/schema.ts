import { relations } from "drizzle-orm";
import type { IsPrimaryKey } from "drizzle-orm/column-builder";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { randomUUID } from "node:crypto";

const _uuid = (name?: string) =>
  text(name)
    .notNull()
    .$defaultFn(() => randomUUID());
function uuid(name?: string, pk?: true): IsPrimaryKey<ReturnType<typeof _uuid>>;
function uuid(name: string, pk: false): ReturnType<typeof _uuid>;
function uuid(name?: string, pk = true) {
  const col = _uuid(name);
  return pk ? col.primaryKey() : col;
}

const date = (name: string) => integer(name, { mode: "timestamp" });

const createdAt = (name = "created_at") =>
  date(name)
    .$defaultFn(() => new Date())
    .notNull();

const updatedAt = (name = "updated_at") =>
  date(name)
    .$onUpdateFn(() => new Date())
    .notNull();

export const users = sqliteTable("users", (t) => ({
  id: uuid(),
  name: t.text().notNull(),
  cash: t.real().notNull().default(0),
}));

export const assets = sqliteTable("assets", (t) => ({
  id: uuid(),
  name: t.text().notNull(),
  image: t.text().notNull(),
  defaultPrice: t.real().notNull(),
}));

export const assetBalances = sqliteTable(
  "asset_balances",
  (t) => ({
    userId: t
      .text()
      .notNull()
      .references(() => users.id),
    assetId: t
      .text()
      .notNull()
      .references(() => assets.id),
    shares: t.real().notNull(),
    updatedAt: updatedAt(),
  }),
  (t) => [
    primaryKey({ columns: [t.userId, t.assetId] }),
    index("assetbalances_assetid_shares_idx").on(t.assetId, t.shares),
  ]
);

export const transactions = sqliteTable(
  "transactions",
  (t) => ({
    id: uuid(),
    userId: t
      .text()
      .notNull()
      .references(() => users.id),
    assetId: t
      .text()
      .notNull()
      .references(() => assets.id),
    type: t.text({ enum: ["buy", "sell"] }).notNull(),
    shares: t.real().notNull(),
    cashAmount: t.real().notNull(),
    latestPrice: t.real().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  }),
  (t) => [
    index("transactions_assetid_createdat_idx").on(t.assetId, t.createdAt),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  assetBalances: many(assetBalances),
  transactions: many(transactions),
}));

export const assetsRelations = relations(assets, ({ many }) => ({
  balances: many(assetBalances),
  transactions: many(transactions),
}));

export const assetBalancesRelations = relations(assetBalances, ({ one }) => ({
  user: one(users, { fields: [assetBalances.userId], references: [users.id] }),
  asset: one(assets, {
    fields: [assetBalances.assetId],
    references: [assets.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  asset: one(assets, {
    fields: [transactions.assetId],
    references: [assets.id],
  }),
}));
