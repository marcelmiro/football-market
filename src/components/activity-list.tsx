export function ActivityList(props: {
  transactions: Array<{
    type: "buy" | "sell";
    shares: number;
    cashAmount: number;
    latestPrice: number;
    user: { name: string };
    createdAt: Date;
  }>;
}) {
  if (!props.transactions.length) {
    return (
      <p className="text-center py-4 text-muted-foreground">No activity yet</p>
    );
  }

  return (
    <div className="space-y-4">
      {props.transactions.map((tx, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">{tx.user.name}</span>{" "}
              <span
                className={
                  tx.type === "buy" ? "text-green-600" : "text-red-600"
                }
              >
                {tx.type === "buy" ? "bought" : "sold"}
              </span>{" "}
              €{tx.cashAmount.toFixed(2)} worth ({tx.shares.toFixed(2)} shares)
            </p>
            <div className="flex justify-between">
              <p className="text-xs text-muted-foreground">
                {formatDate(tx.createdAt)}
              </p>
              <p className="text-xs">Price: €{tx.latestPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Function to format date
const formatDate = (date: Date) => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    // Today - show time
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays < 7) {
    // This week - show day and time
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    // Older - show date
    return date.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};
