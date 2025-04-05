"use client";

import { PlayerCard } from "@/components/player-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function AssetList({
  assets,
}: {
  assets: Array<{
    id: string;
    name: string;
    image: string;
    latestPrice: number;
  }>;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter assets based on search query
  const filteredAssets = !searchQuery
    ? assets
    : assets.filter((asset) =>
        asset.name
          .toLowerCase()
          .normalize("NFD")
          .includes(searchQuery.toLowerCase().normalize("NFD"))
      );

  return (
    <>
      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search players..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredAssets.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          `No players found matching "{searchQuery}"
        </p>
      ) : (
        <div className="grid gap-4">
          {filteredAssets.map((player) => (
            <PlayerCard
              key={player.id}
              id={player.id}
              name={player.name}
              price={player.latestPrice}
              // change={player.change}
              imageUrl={player.image}
            />
          ))}
        </div>
      )}
    </>
  );
}
