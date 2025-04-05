"use client";

import { useState, useEffect, useMemo, useActionState, useRef } from "react";
import { X } from "lucide-react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { computeMovement } from "@/dto";
import { buy, sell } from "@/actions";
import { useRouter } from "next/navigation";

export function TransactionVault(props: {
  open: boolean;
  close: () => void;
  assetId: string;
  assetName: string;
  latestPrice: number;
  type: "buy" | "sell";
  cashAmount: number;
  currentShares?: number;
  onOpenChange: (open: boolean) => void;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [amount, setAmount] = useState(0);
  const [shares, setShares] = useState(0);

  const [state, submit, isPending] = useActionState(
    props.type === "buy" ? buy : sell,
    { error: undefined, errors: undefined }
  );

  const router = useRouter();

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

  useEffect(() => {
    if (state.success) {
      props.close();
      router.refresh();
    }
  }, [state.success]);

  // Reset values when drawer opens or transaction type changes
  useEffect(() => {
    if (props.open) {
      // Start with a reasonable default amount (10% of max for buy, 25% for sell)
      const defaultAmount =
        props.type === "buy"
          ? Math.min(50, maxAmount * 0.1)
          : Math.min(maxAmount * 0.25, maxAmount);

      handleAmountChange(Number(defaultAmount.toFixed(2)));
    }
  }, [props.open, props.type, maxAmount, props.latestPrice]);

  // Handle amount change (from input or slider)
  const handleAmountChange = (newAmount: number) => {
    // Ensure amount is within limits
    const validAmount = Number(
      Math.min(Math.max(0, newAmount), maxAmount).toFixed(2)
    );
    setAmount(validAmount);

    const calculatedShares = computeMovement({
      type: props.type,
      amountType: "cash",
      amount: validAmount,
      latestPrice: props.latestPrice,
    }).shares;

    setShares(calculatedShares);
  };

  return (
    <Drawer.Root
      open={props.open}
      onOpenChange={(open) => {
        if (!open) {
          ref.current?.reset();
          state.success = false;
          props.close();
        }
        props.onOpenChange(open);
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-[90%] mt-24 fixed bottom-0 left-0 right-0 z-50">
          <div className="p-4 bg-white rounded-t-[10px] flex-1 overflow-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />

            <form ref={ref} action={submit} className="max-w-md mx-auto">
              <input type="hidden" name="assetId" value={props.assetId} />
              <input type="hidden" name="shares" value={shares} />

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {props.type === "buy" ? "Buy" : "Sell"} {props.assetName}
                </h2>
                <Drawer.Close className="rounded-full p-1 hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </Drawer.Close>
              </div>

              <p className="text-gray-500 mb-6">
                Current price: €{props.latestPrice.toFixed(2)} per share
              </p>

              <div className="py-6 space-y-6">
                {/* Balance and holdings info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Cash Balance</p>
                    <p className="font-medium">
                      €{props.cashAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Your Shares</p>
                    <p className="font-medium">
                      {(props.currentShares ?? 0).toFixed(4)}
                    </p>
                  </div>
                </div>

                {/* Amount input */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="cashAmount" className="text-sm font-medium">
                      Amount (€)
                    </label>
                    <span className="text-xs text-gray-500">
                      {props.type === "buy"
                        ? `Min: €${MIN_TRANSACTION_AMOUNT}`
                        : "No minimum"}{" "}
                      | Max: €{maxAmount.toFixed(2)}
                    </span>
                  </div>
                  <Input
                    id="cashAmount"
                    name="cashAmount"
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

                {/* Transaction summary */}
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">Transaction Summary</h4>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <p>Total Amount:</p>
                    <p className="text-right font-medium">
                      €{amount.toFixed(2)}
                    </p>

                    <p>Shares:</p>
                    <p className="text-right font-medium">
                      {shares.toFixed(4)}
                    </p>

                    <div className="col-span-2 border-t my-1"></div>

                    <p className="font-medium">New Balance:</p>
                    <p className="text-right font-medium">
                      €
                      {(props.type === "buy"
                        ? props.cashAmount - amount
                        : props.cashAmount + amount
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Error message */}
                {(state?.error || state?.errors) && (
                  <div className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm">
                    {state.error || JSON.stringify(state.errors)}
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-6 mb-4">
                <Drawer.Close asChild>
                  <Button
                    variant="outline"
                    disabled={isPending}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </Drawer.Close>
                <Button
                  type="submit"
                  disabled={
                    (props.type === "buy" && amount < MIN_TRANSACTION_AMOUNT) ||
                    (props.type === "sell" && amount <= 0) ||
                    isPending
                  }
                  className={`flex-1 ${
                    props.type === "buy"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isPending
                    ? "Processing..."
                    : props.type === "buy"
                    ? "Buy"
                    : "Sell"}
                </Button>
              </div>
            </form>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
