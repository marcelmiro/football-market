import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface PlayerCardProps {
  id: string;
  name: string;
  // team: string
  price: number;
  // change: number
  imageUrl: string;
  shares?: number;
}

export function PlayerCard({
  id,
  name,
  price,
  imageUrl,
  shares,
}: PlayerCardProps) {
  // const isPositive = change >= 0

  return (
    <Link href={`/player/${id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted">
              <Image src={imageUrl} alt={name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{name}</h3>
              {/* <p className="text-sm text-muted-foreground">{team}</p> */}
              {typeof shares === "number" && (
                <p className="text-xs text-blue-700 mt-1">
                  {shares.toFixed(4)} shares
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium">€{price.toFixed(2)}</p>
              {/* <div
                className={`flex items-center justify-end text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}
              >
                {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                {Math.abs(change).toFixed(2)}
              </div> */}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
