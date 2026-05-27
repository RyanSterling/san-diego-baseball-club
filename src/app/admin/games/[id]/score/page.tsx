"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminButton, AdminCard, AdminLoadingState } from "@/components/admin/ui";
import { useToast } from "@/components/admin/ui/AdminToast";

interface Game {
  _id: string;
  date: string;
  opponent: string;
  homeOrAway: string;
  ourScore: number | null;
  theirScore: number | null;
  result: string | null;
}

export default function QuickScorePage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.id as string;
  const { showSuccess, showError } = useToast();

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ourScore, setOurScore] = useState(0);
  const [theirScore, setTheirScore] = useState(0);

  useEffect(() => {
    async function fetchGame() {
      try {
        const res = await fetch(`/api/admin/games/${gameId}`);
        const data = await res.json();

        if (data.success && data.game) {
          setGame(data.game);
          setOurScore(data.game.ourScore || 0);
          setTheirScore(data.game.theirScore || 0);
        }
      } catch (error) {
        console.error("Failed to fetch game:", error);
        showError("Failed to load game");
      } finally {
        setLoading(false);
      }
    }

    fetchGame();
  }, [gameId, showError]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/games/${gameId}/score`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ourScore, theirScore }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update score");
      }

      showSuccess("Score saved!");
      router.push("/admin/games");
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to save score");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const getResult = () => {
    if (ourScore > theirScore) return "W";
    if (ourScore < theirScore) return "L";
    return "T";
  };

  if (loading) {
    return <AdminLoadingState variant="card" />;
  }

  if (!game) {
    return (
      <div className="text-center py-12">
        <p className="text-white/50">Game not found</p>
      </div>
    );
  }

  const result = getResult();

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-headline text-3xl uppercase tracking-tight text-white text-center mb-2">
        Quick <span className="text-teal">Score</span>
      </h1>
      <p className="text-white/50 text-center mb-8">
        {game.homeOrAway === "away" ? "@ " : "vs "}
        {game.opponent} • {formatDate(game.date)}
      </p>

      <AdminCard>
        <div className="py-8">
          {/* Score Display */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Us */}
            <div className="text-center">
              <p className="text-white/50 font-headline uppercase tracking-wide mb-4">
                Us
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setOurScore(Math.max(0, ourScore - 1))}
                  className="w-16 h-16 bg-white/10 text-white text-3xl rounded-xl hover:bg-white/20 transition-colors active:scale-95"
                >
                  -
                </button>
                <span className="text-7xl font-headline text-teal w-24 text-center">
                  {ourScore}
                </span>
                <button
                  onClick={() => setOurScore(ourScore + 1)}
                  className="w-16 h-16 bg-white/10 text-white text-3xl rounded-xl hover:bg-white/20 transition-colors active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* Them */}
            <div className="text-center">
              <p className="text-white/50 font-headline uppercase tracking-wide mb-4">
                Them
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setTheirScore(Math.max(0, theirScore - 1))}
                  className="w-16 h-16 bg-white/10 text-white text-3xl rounded-xl hover:bg-white/20 transition-colors active:scale-95"
                >
                  -
                </button>
                <span className="text-7xl font-headline text-orange w-24 text-center">
                  {theirScore}
                </span>
                <button
                  onClick={() => setTheirScore(theirScore + 1)}
                  className="w-16 h-16 bg-white/10 text-white text-3xl rounded-xl hover:bg-white/20 transition-colors active:scale-95"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Result Preview */}
          <div className="text-center mb-8">
            <span
              className={`text-5xl font-headline ${
                result === "W"
                  ? "text-win"
                  : result === "L"
                  ? "text-loss"
                  : "text-tie"
              }`}
            >
              {result === "W" ? "WIN" : result === "L" ? "LOSS" : "TIE"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <AdminButton
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancel
            </AdminButton>
            <AdminButton onClick={handleSave} loading={saving} size="lg">
              Save Score
            </AdminButton>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
