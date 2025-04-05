const VOLATILITY_FACTOR = 10;

export function computeMovement(opts: {
  type: "buy" | "sell";
  amountType: "cash" | "shares";
  amount: number;
  latestPrice: number;
}) {
  if (opts.amountType === "cash") {
    const cashAmount = round(opts.amount, 4);

    const change = round(
      (VOLATILITY_FACTOR * cashAmount * (opts.type === "buy" ? 1 : -1)) /
        opts.latestPrice,
      4
    );

    const newPrice = opts.latestPrice + change;
    const shares = round(cashAmount / newPrice, 8);

    return { cashAmount, shares, newPrice };
  } else {
    opts.amountType satisfies "shares";

    const shares = round(opts.amount, 8);

    const newPrice = round(
      opts.latestPrice /
        (1 +
          ((opts.type === "buy" ? -1 : 1) * VOLATILITY_FACTOR * shares) /
            opts.latestPrice),
      4
    );

    const cashAmount = round(shares * newPrice, 4);
    return { cashAmount, shares, newPrice };
  }
}

const round = (num: number, dp: number) =>
  Math.round((num + Number.EPSILON) * 10 ** dp) / 10 ** dp;
