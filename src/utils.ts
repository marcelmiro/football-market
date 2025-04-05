import type { PropsWithChildren } from "react";
import { sql, type SQL } from "drizzle-orm";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sqlNonNegative = (expression: SQL) =>
  sql`CASE WHEN ${expression} < 0 THEN 0 ELSE ${expression} END`;

export type EmptyObject = Record<PropertyKey, never>;
export type UnknownObject = Record<PropertyKey, unknown> | unknown[];

export type SearchParams = Record<string, string | string[]>;

export type LayoutProps<
  TParams extends Record<string, string | string[]> = EmptyObject
> = PropsWithChildren<{ params: Promise<TParams> }>;

export interface PageProps<
  TParams extends Record<string, string | string[]> = EmptyObject
> {
  params: Promise<TParams>;
  searchParams: Promise<SearchParams>;
}
