"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { Season } from "@/types/sanity";

interface SeasonSelectorProps {
  seasons: Season[];
}

export default function SeasonSelector({ seasons }: SeasonSelectorProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get current season from URL, default to the current/latest season
  const currentSeasonSlug = searchParams.get("season");
  const defaultSeason = seasons.find((s) => s.isCurrent) || seasons[0];
  const selectedSlug = currentSeasonSlug || defaultSeason?.slug;

  const handleSeasonChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSlug = e.target.value;
      const params = new URLSearchParams(searchParams.toString());

      // If selecting the default season, remove the param for cleaner URLs
      if (newSlug === defaultSeason?.slug) {
        params.delete("season");
      } else {
        params.set("season", newSlug);
      }

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [searchParams, pathname, router, defaultSeason?.slug]
  );

  if (seasons.length === 0) {
    return null;
  }

  // If only one season, show it as a label instead of a dropdown
  if (seasons.length === 1) {
    return (
      <span className="text-white text-sm font-headline uppercase tracking-wide">
        {seasons[0].name}
      </span>
    );
  }

  return (
    <select
      value={selectedSlug}
      onChange={handleSeasonChange}
      aria-label="Select season"
      className="bg-dark/50 text-white text-sm border border-white/20 px-2 py-1 font-headline uppercase tracking-wide cursor-pointer hover:border-teal focus:border-teal focus:outline-none transition-colors"
    >
      {seasons.map((season) => (
        <option key={season._id} value={season.slug} className="bg-dark">
          {season.name}
        </option>
      ))}
    </select>
  );
}
