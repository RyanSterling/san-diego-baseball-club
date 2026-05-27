import { Suspense } from "react";
import Nav from "./Nav";
import SeasonSelector from "./SeasonSelector";
import { client } from "@/lib/sanity/client";
import { allSeasonsQuery } from "@/lib/sanity/queries";
import type { Season } from "@/types/sanity";

async function getSeasons(): Promise<Season[]> {
  try {
    return await client.fetch(allSeasonsQuery);
  } catch {
    return [];
  }
}

export default async function Header() {
  const seasons = await getSeasons();

  return (
    <header className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Season Selector - Left */}
          <div className="w-32">
            <Suspense fallback={null}>
              <SeasonSelector seasons={seasons} />
            </Suspense>
          </div>

          {/* Navigation - Center */}
          <Nav />

          {/* Empty spacer - Right */}
          <div className="w-32 hidden md:block" />
        </div>
      </div>
    </header>
  );
}
