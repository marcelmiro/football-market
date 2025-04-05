"use client";

import { useState, useEffect, useMemo } from "react";

import { buy, sell } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { computeMovement } from "@/dto";

export function TransactionDrawer(props: {
  open: boolean;
  close: () => void;
  assetId: string;
  assetName: string;
  latestPrice: number;
  type: "buy" | "sell";
  cashAmount: number;
  currentShares?: number;
}) {
  const [amount, setAmount] = useState(0);
  const [shares, setShares] = useState(0);

  const MIN_TRANSACTION_AMOUNT = 0.01;

  // Calculate max transaction amount
  const maxBuyAmount = props.cashAmount;
  const maxSellAmount = useMemo(
    () =>
      !props.currentShares
        ? 0
        : computeMovement({
            type: "sell",
            amountType: "shares",
            amount: props.currentShares,
            latestPrice: props.latestPrice,
          }).cashAmount,
    [props.currentShares, props.latestPrice]
  );
  const maxAmount = props.type === "buy" ? maxBuyAmount : maxSellAmount;

  // Reset values when drawer opens or transaction type changes
  useEffect(() => {
    if (props.open) {
      // Start with a reasonable default amount (10% of max for buy, 25% for sell)
      const defaultAmount =
        props.type === "buy"
          ? Math.min(50, maxAmount * 0.1)
          : Math.min(maxAmount * 0.25, maxAmount);

      handleAmountChange(defaultAmount);
    }
  }, [props.open, props.type, maxAmount, props.latestPrice]);

  // Handle amount change (from input or slider)
  const handleAmountChange = (newAmount: number) => {
    // Ensure amount is within limits
    const validAmount = Math.min(Math.max(0, newAmount), maxAmount);
    setAmount(validAmount);

    // Calculate shares based on amount
    const calculatedShares = validAmount / props.latestPrice;
    setShares(Number.parseFloat(calculatedShares.toFixed(4)));
  };

  // Handle shares change
  const handleSharesChange = (newShares: number) => {
    // Ensure shares is within limits
    const maxShares = maxAmount / props.latestPrice;
    const validShares = Math.min(Math.max(0, newShares), maxShares);
    setShares(validShares);

    // Calculate amount based on shares
    const calculatedAmount = validShares * props.latestPrice;
    setAmount(Number.parseFloat(calculatedAmount.toFixed(2)));
  };

  // Execute transaction
  const executeTransaction = () => {
    // Validate transaction
    if (amount < MIN_TRANSACTION_AMOUNT) {
      setError(`Minimum transaction amount is €${MIN_TRANSACTION_AMOUNT}`);
      return;
    }

    if (transactionType === "buy" && amount + transactionFee > cashBalance) {
      setError("Insufficient funds");
      return;
    }

    if (transactionType === "sell" && shares > currentHoldings) {
      setError("Insufficient shares");
      return;
    }

    setIsProcessing(true);

    // Simulate transaction processing
    setTimeout(() => {
      try {
        // Create activity record
        const activity = createActivity(playerId, transactionType, amount, {
          name: "You",
          avatar: "/placeholder.svg?height=40&width=40",
          initials: "YO",
        });

        // Update cash balance
        if (transactionType === "buy") {
          updateCashBalance(cashBalance - amount - transactionFee);
        } else {
          updateCashBalance(cashBalance + amount - transactionFee);
        }

        // Update player holdings
        const newHoldings =
          transactionType === "buy"
            ? currentHoldings + shares
            : currentHoldings - shares;

        updatePlayerHoldings(playerId, newHoldings);

        // Notify parent component
        onTransactionComplete(activity);

        // Close drawer
        onClose();
      } catch (err) {
        setError("Transaction failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }, 1000);
  };

  return (
    <Sheet open={props.open} onOpenChange={props.close}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {props.type === "buy" ? "Buy" : "Sell"} {props.assetName}
          </SheetTitle>
          <SheetDescription>
            Current price: €{props.latestPrice.toFixed(2)} per share
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Cash Balance</p>
              <p className="font-medium">€{props.cashAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Shares</p>
              <p className="font-medium">
                {(props.currentShares ?? 0).toFixed(4)}
              </p>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="amount" className="text-sm font-medium">
                Amount (€)
              </label>
              <span className="text-xs text-muted-foreground">
                Min: €{MIN_TRANSACTION_AMOUNT} | Max: €{maxAmount.toFixed(2)}
              </span>
            </div>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) =>
                handleAmountChange(Number.parseFloat(e.target.value) || 0)
              }
              min={0}
              max={maxAmount}
              step={0.01}
              className="font-medium"
            />
            <Slider
              value={[amount]}
              min={0}
              max={maxAmount}
              step={maxAmount / 100}
              onValueChange={([value]) =>
                value !== undefined && handleAmountChange(value)
              }
              className="py-4"
            />
          </div>

          {/* Shares input */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="shares" className="text-sm font-medium">
                Shares
              </label>
              <span className="text-xs text-muted-foreground">
                Max: {(maxAmount / props.latestPrice).toFixed(4)}
              </span>
            </div>
            <Input
              id="shares"
              type="number"
              value={shares}
              onChange={(e) =>
                handleSharesChange(Number.parseFloat(e.target.value) || 0)
              }
              min={0}
              max={maxAmount / props.latestPrice}
              step={0.0001}
              className="font-medium"
            />
          </div>

          {/* Transaction summary */}
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <h4 className="font-medium">Transaction Summary</h4>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <p>Subtotal:</p>
              <p className="text-right">€{amount.toFixed(2)}</p>

              <div className="col-span-2 border-t my-1"></div>

              <p className="font-medium">Total:</p>
              <p className="text-right font-medium">€{amount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={props.close}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={executeTransaction}
            disabled={amount < MIN_TRANSACTION_AMOUNT || isProcessing}
            className={
              props.type === "buy"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {isProcessing
              ? "Processing..."
              : props.type === "buy"
              ? "Buy"
              : "Sell"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
