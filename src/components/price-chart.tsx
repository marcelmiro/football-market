// price-chart.tsx
"use client";
import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Timeframe = "1D" | "1W" | "1M" | "1Y";

type Props = {
  latestPrice: number;
  transactions: Array<{ latestPrice: number; createdAt: Date }>;
};

export function PriceChart(props: {
  latestPrice: number;
  transactions: Array<{ latestPrice: number; createdAt: Date }>;
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [chartData, setChartData] = useState(
    updateChartData({ ...props, timeframe })
  );

  // Get min and max prices for y-axis domain
  const prices = chartData
    .map((d) => d.price)
    .filter((p) => p !== null) as number[];
  const minPrice = prices.length ? Math.min(...prices) * 0.95 : 0;
  const maxPrice = prices.length ? Math.max(...prices) * 1.05 : 100;

  // Get axis labels based on timeframe
  const getXAxisLabel = () => {
    switch (timeframe) {
      case "1D":
        return "Time (hours)";
      case "1W":
        return "Day";
      case "1M":
        return "Date";
      case "1Y":
        return "Month";
      default:
        return "Time";
    }
  };

  return (
    <div>
      <div className="flex justify-end gap-1 mb-2">
        <Button
          variant={timeframe === "1D" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setTimeframe("1D");
            setChartData(updateChartData({ ...props, timeframe: "1D" }));
          }}
          className="h-7 px-2 text-xs"
        >
          1D
        </Button>
        <Button
          variant={timeframe === "1W" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setTimeframe("1W");
            setChartData(updateChartData({ ...props, timeframe: "1W" }));
          }}
          className="h-7 px-2 text-xs"
        >
          1W
        </Button>
        <Button
          variant={timeframe === "1M" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setTimeframe("1M");
            setChartData(updateChartData({ ...props, timeframe: "1M" }));
          }}
          className="h-7 px-2 text-xs"
        >
          1M
        </Button>
        <Button
          variant={timeframe === "1Y" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setTimeframe("1Y");
            setChartData(updateChartData({ ...props, timeframe: "1Y" }));
          }}
          className="h-7 px-2 text-xs"
        >
          1Y
        </Button>
      </div>
      {chartData.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          No price data available for this timeframe
        </div>
      ) : (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.2}
              />
              <XAxis
                dataKey="formattedDate"
                axisLine={true}
                tickLine={true}
                tick={{ fontSize: 10 }}
                label={{
                  value: getXAxisLabel(),
                  position: "bottom",
                  offset: 0,
                  fontSize: 12,
                }}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                axisLine={true}
                tickLine={true}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `€${value.toFixed(0)}`}
                label={{
                  value: "Price (€)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 12,
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const data = payload[0]?.payload;
                    return (
                      <Card className="p-2 text-xs shadow-lg">
                        <div className="font-medium">{data.formattedDate}</div>
                        <div>€{data.price?.toFixed(2)}</div>
                      </Card>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={props.latestPrice}
                stroke="#ff6b6b"
                strokeDasharray="3 3"
                label={{
                  value: `Current: €${props.latestPrice.toFixed(2)}`,
                  position: "right",
                  fill: "#ff6b6b",
                  fontSize: 10,
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorPrice)"
                // dot={(props) => {
                //   // Only show dots for actual data points
                //   const { cx, cy, payload } = props;
                //   console.log(payload);
                //   if (!payload.isDataPoint) return null;
                //   return (
                //     <circle
                //       cx={cx}
                //       cy={cy}
                //       r={4}
                //       fill="#10b981"
                //       stroke="#fff"
                //       strokeWidth={2}
                //     />
                //   );
                // }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function updateChartData(opts: Props & { timeframe: Timeframe }) {
  if (!opts.transactions.length) return [];

  // Get date intervals based on timeframe
  const { startDate, intervalType, intervals } = getDateIntervals(
    opts.timeframe
  );

  // Generate interval points
  const intervalPoints = generateIntervalPoints(
    startDate,
    intervalType,
    intervals
  );

  // Filter transactions based on selected timeframe and sort in ascending order
  const parsedTxs = opts.transactions
    .filter((tx) => new Date(tx.createdAt) >= startDate)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  // Create chart data with interval points
  const data = intervalPoints.map((intervalDate, index) => {
    const intervalEndDate =
      index < intervalPoints.length - 1
        ? intervalPoints[index + 1]
        : new Date(); // Use current time as the end of the last interval

    // Filter transactions that fall within this interval
    const txsInInterval = parsedTxs.filter((tx) => {
      const txDate = new Date(tx.createdAt);
      return txDate >= intervalDate && txDate < intervalEndDate!;
    });

    // Get the closing price (last transaction in the interval)
    let price: number | null = null;
    let isDataPoint = false;

    if (txsInInterval.length > 0) {
      // Use the last transaction in this interval (closing price)
      price = txsInInterval[txsInInterval.length - 1]!.latestPrice;
      isDataPoint = true;
    } else {
      // Find the most recent transaction before this interval
      const prevTxs = parsedTxs.filter(
        (tx) => new Date(tx.createdAt) < intervalDate
      );

      if (prevTxs.length > 0) {
        // Use the most recent prior transaction price
        price = prevTxs[prevTxs.length - 1]!.latestPrice;
      } else {
        // If no prior transactions, use the latest price
        price = opts.latestPrice;
      }
    }

    return {
      date: intervalDate.toISOString(),
      price: price,
      formattedDate: formatDate(intervalDate, opts.timeframe),
      isDataPoint,
    };
  });

  return data;
}

// Helper function to get date intervals based on timeframe
const getDateIntervals = (timeframe: string) => {
  const now = new Date();
  let startDate: Date;
  let intervalType: "hour" | "day" | "week" | "month";
  let intervals: number;

  switch (timeframe) {
    case "1D":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      intervalType = "hour";
      intervals = 24;
      break;
    case "1W":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      intervalType = "day";
      intervals = 7;
      break;
    case "1M":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      intervalType = "day";
      intervals = 30;
      break;
    case "1Y":
    default:
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      intervalType = "month";
      intervals = 12;
      break;
  }

  // Reset time components for consistent intervals (except for hourly intervals)
  if (intervalType !== "hour") {
    startDate.setHours(0, 0, 0, 0);
  }

  return { startDate, intervalType, intervals };
};

// Helper function to generate interval points
const generateIntervalPoints = (
  startDate: Date,
  intervalType: "hour" | "day" | "week" | "month",
  intervals: number
) => {
  const points = [];
  const now = new Date();

  for (let i = 0; i <= intervals; i++) {
    const date = new Date(startDate);

    if (intervalType === "hour") {
      date.setHours(date.getHours() + i);
    } else if (intervalType === "day") {
      date.setDate(date.getDate() + i);
    } else if (intervalType === "week") {
      date.setDate(date.getDate() + i * 7);
    } else if (intervalType === "month") {
      date.setMonth(date.getMonth() + i);
    }

    // Don't add future dates
    if (date > now) {
      break;
    }

    points.push(date);
  }

  return points;
};

// Helper function to format date based on timeframe
const formatDate = (date: Date, timeframe: string) => {
  if (timeframe === "1D") {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (timeframe === "1W") {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  } else if (timeframe === "1M") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } else {
    return date.toLocaleDateString("en-US", { month: "short" });
  }
};
