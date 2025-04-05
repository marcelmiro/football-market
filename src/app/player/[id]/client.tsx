"use client";

import dynamic from "next/dynamic";

import { useBottomNavigation } from "@/providers/bottom-navigation-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionVault } from "@/components/transaction-vault";

const PriceChart = dynamic(
  () => import("@/components/price-chart").then((mod) => mod.PriceChart),
  { ssr: false }
);

const ActivityList = dynamic(
  () => import("@/components/activity-list").then((mod) => mod.ActivityList),
  { ssr: false }
);

export default function PlayerClient(props: {
  id: string;
  name: string;
  latestPrice: number;
  cashAmount: number;
  currentShares?: number;
  transactions: Array<{
    type: "buy" | "sell";
    shares: number;
    cashAmount: number;
    latestPrice: number;
    createdAt: Date;
    user: { name: string };
  }>;
}) {
  const router = useRouter();

  const { hideNavigation, showNavigation } = useBottomNavigation();
  const [transactionVault, setTransactionVault] = useState<{
    isOpen: boolean;
    type: "buy" | "sell";
  }>({ isOpen: false, type: "buy" });

  const openTransactionVault = (type: "buy" | "sell") => {
    hideNavigation(); // Hide bottom navigation when vault opens
    setTransactionVault({ isOpen: true, type });
  };

  // Close transaction vault
  const closeTransactionVault = () => {
    showNavigation(); // Show bottom navigation when vault closes
    setTransactionVault({ ...transactionVault, isOpen: false });
  };

  // Handle transaction vault open state change
  const handleVaultOpenChange = (open: boolean) => {
    if (open) hideNavigation();
    else showNavigation();
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-3xl font-bold">
                €{props.latestPrice.toFixed(2)}
              </p>
            </div>
            {/* <div
              className={`flex items-center text-lg ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <ArrowUp className="h-5 w-5 mr-1" />
              ) : (
                <ArrowDown className="h-5 w-5 mr-1" />
              )}
              €{Math.abs(player.change).toFixed(2)} (
              {((Math.abs(player.change) / player.price) * 100).toFixed(2)}%)
            </div> */}
          </div>

          <div className="h-[240px] mt-4">
            <PriceChart
              latestPrice={props.latestPrice}
              transactions={props.transactions}
            />
          </div>

          {/* Player holdings (only shown if user has shares) */}
          {!!props.currentShares && (
            <div className="mt-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h3 className="font-medium text-blue-800">Your Position</h3>
                  <p className="font-medium text-blue-700">
                    €{(props.currentShares * props.latestPrice).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Buy/Sell buttons */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => openTransactionVault("buy")}
            >
              Buy
            </Button>
            <Button
              variant="outline"
              className={`w-full ${
                !!props.currentShares
                  ? "text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                  : "text-muted-foreground border-muted"
              }`}
              onClick={() => openTransactionVault("sell")}
              disabled={!props.currentShares}
            >
              Sell
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* <Card className="mb-6">
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{player.description}</p>
        </CardContent>
      </Card> */}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityList transactions={props.transactions} />
        </CardContent>
      </Card>

      <TransactionVault
        assetId={props.id}
        assetName={props.name}
        latestPrice={props.latestPrice}
        type={transactionVault.type}
        cashAmount={props.cashAmount}
        currentShares={props.currentShares}
        open={transactionVault.isOpen}
        close={closeTransactionVault}
        onOpenChange={handleVaultOpenChange}
      />
    </>
  );
}
