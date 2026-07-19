"use client";

import { useState, useCallback, useEffect } from "react";

interface Player {
  _id: string;
  name: string;
  jerseyNumber: number;
}

interface Game {
  _id: string;
  slug: string;
  date: string;
  opponent: string;
  homeOrAway: string;
  result?: string;
  ourScore?: number;
  theirScore?: number;
  hasStats: boolean;
}

interface ParsedStat {
  playerName: string;
  jerseyNumber?: number;
  matchedPlayerId?: string | null;
  plateAppearances: number;
  atBats: number;
  singles: number;
  hits: number;
  runs: number;
  rbi: number;
  walks: number;
  hitByPitch: number;
  sacrifices: number;
  strikeouts: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  stolenBases: number;
  caughtStealing: number;
  inningsPitched?: number | null;
  earnedRuns?: number | null;
  pitchingStrikeouts?: number | null;
  pitchingWalks?: number | null;
  hitsAllowed?: number | null;
}

type EntryMode = "select" | "manual" | "image" | "edit";

export default function StatsEntryPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [roster, setRoster] = useState<Player[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [entryMode, setEntryMode] = useState<EntryMode>("select");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [parsedStats, setParsedStats] = useState<ParsedStat[]>([]);
  const [gameScore, setGameScore] = useState<{ ourScore: number; theirScore: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);

  // Fetch games and roster on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [gamesRes, rosterRes] = await Promise.all([
          fetch("/api/games-for-stats"),
          fetch("/api/roster"),
        ]);
        if (gamesRes.ok) {
          const data = await gamesRes.json();
          setGames(data.games || []);
        }
        if (rosterRes.ok) {
          const data = await rosterRes.json();
          setRoster(data.players || []);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    }
    fetchData();
  }, []);

  // Reset mode when game changes
  const handleGameChange = (gameId: string) => {
    setSelectedGameId(gameId);
    setEntryMode("select");
    setParsedStats([]);
    setImagePreview(null);
    setImageData(null);
    setGameScore(null);
    setError(null);
    setSuccess(null);
  };

  // Initialize manual entry with roster players
  const handleStartManualEntry = () => {
    setEntryMode("manual");
    // Pre-populate with roster players, all with empty stats
    const manualStats: ParsedStat[] = roster.map((player) => ({
      playerName: player.name,
      jerseyNumber: player.jerseyNumber,
      matchedPlayerId: player._id,
      plateAppearances: 0,
      atBats: 0,
      singles: 0,
      hits: 0,
      runs: 0,
      rbi: 0,
      walks: 0,
      hitByPitch: 0,
      sacrifices: 0,
      strikeouts: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      stolenBases: 0,
      caughtStealing: 0,
      inningsPitched: null,
      earnedRuns: null,
      pitchingStrikeouts: null,
      pitchingWalks: null,
      hitsAllowed: null,
    }));
    setParsedStats(manualStats);
    setGameScore({ ourScore: 0, theirScore: 0 });
  };

  // Load existing stats for editing
  const handleLoadExistingStats = async () => {
    if (!selectedGameId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/game-stats?gameId=${selectedGameId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load stats");
      }

      if (data.game?.playerStats && data.game.playerStats.length > 0) {
        const existingStats: ParsedStat[] = data.game.playerStats.map((stat: {
          player: { _id: string; name: string; jerseyNumber: number };
          plateAppearances?: number;
          atBats?: number;
          singles?: number;
          hits?: number;
          runs?: number;
          rbi?: number;
          walks?: number;
          hitByPitch?: number;
          sacrifices?: number;
          strikeouts?: number;
          doubles?: number;
          triples?: number;
          homeRuns?: number;
          stolenBases?: number;
          caughtStealing?: number;
          inningsPitched?: number;
          earnedRuns?: number;
          pitchingStrikeouts?: number;
          pitchingWalks?: number;
          hitsAllowed?: number;
        }) => ({
          playerName: stat.player.name,
          jerseyNumber: stat.player.jerseyNumber,
          matchedPlayerId: stat.player._id,
          plateAppearances: stat.plateAppearances || 0,
          atBats: stat.atBats || 0,
          singles: stat.singles || 0,
          hits: stat.hits || 0,
          runs: stat.runs || 0,
          rbi: stat.rbi || 0,
          walks: stat.walks || 0,
          hitByPitch: stat.hitByPitch || 0,
          sacrifices: stat.sacrifices || 0,
          strikeouts: stat.strikeouts || 0,
          doubles: stat.doubles || 0,
          triples: stat.triples || 0,
          homeRuns: stat.homeRuns || 0,
          stolenBases: stat.stolenBases || 0,
          caughtStealing: stat.caughtStealing || 0,
          inningsPitched: stat.inningsPitched ?? null,
          earnedRuns: stat.earnedRuns ?? null,
          pitchingStrikeouts: stat.pitchingStrikeouts ?? null,
          pitchingWalks: stat.pitchingWalks ?? null,
          hitsAllowed: stat.hitsAllowed ?? null,
        }));

        setParsedStats(existingStats);
        setGameScore({
          ourScore: data.game.ourScore || 0,
          theirScore: data.game.theirScore || 0,
        });
        setEntryMode("edit");
      } else {
        setError("No existing stats found for this game");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  // Clear all stats for the game
  const handleClearStats = async () => {
    if (!selectedGameId) return;

    setClearing(true);
    setError(null);

    try {
      const response = await fetch("/api/save-stats", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: selectedGameId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to clear stats");
      }

      setSuccess("All stats cleared successfully!");
      setShowClearModal(false);
      setParsedStats([]);
      setGameScore(null);
      setEntryMode("select");

      // Update the games list to reflect the change
      setGames((prev) =>
        prev.map((g) =>
          g._id === selectedGameId ? { ...g, hasStats: false } : g
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear stats");
    } finally {
      setClearing(false);
    }
  };

  const handleImageDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processImage(file);
    }
  }, []);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  }, []);

  const processImage = (file: File) => {
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageData(result);
    };
    reader.readAsDataURL(file);
  };

  const handleParse = async () => {
    if (!imageData) return;

    setLoading(true);
    setError(null);
    setParsedStats([]);
    setGameScore(null);

    try {
      const response = await fetch("/api/parse-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData, mimeType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse stats");
      }

      if (data.parsedStats?.players) {
        setParsedStats(data.parsedStats.players);
      }
      if (data.parsedStats?.gameScore) {
        setGameScore(data.parsedStats.gameScore);
      }
      if (data.roster) {
        setRoster(data.roster);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse stats");
    } finally {
      setLoading(false);
    }
  };

  // Add a new empty player row for manual entry
  const handleAddPlayer = () => {
    setParsedStats((prev) => [
      ...prev,
      {
        playerName: "",
        matchedPlayerId: null,
        plateAppearances: 0,
        atBats: 0,
        singles: 0,
        hits: 0,
        runs: 0,
        rbi: 0,
        walks: 0,
        hitByPitch: 0,
        sacrifices: 0,
        strikeouts: 0,
        doubles: 0,
        triples: 0,
        homeRuns: 0,
        stolenBases: 0,
        caughtStealing: 0,
        inningsPitched: null,
        earnedRuns: null,
        pitchingStrikeouts: null,
        pitchingWalks: null,
        hitsAllowed: null,
      },
    ]);
  };

  // Remove a player row
  const handleRemovePlayer = (index: number) => {
    setParsedStats((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStatChange = (index: number, field: keyof ParsedStat, value: string | number | null) => {
    setParsedStats((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handlePlayerMatch = (index: number, playerId: string) => {
    setParsedStats((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], matchedPlayerId: playerId || null };
      return updated;
    });
  };

  const handleSave = async () => {
    if (!selectedGameId) {
      setError("Please select a game");
      return;
    }

    // Filter out stats without matched players
    const statsToSave = parsedStats.filter((s) => s.matchedPlayerId);
    if (statsToSave.length === 0) {
      setError("Please match at least one player");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/save-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: selectedGameId,
          playerStats: statsToSave.map((s) => ({
            playerId: s.matchedPlayerId,
            plateAppearances: s.plateAppearances,
            atBats: s.atBats,
            singles: s.singles,
            hits: s.hits,
            runs: s.runs,
            rbi: s.rbi,
            walks: s.walks,
            hitByPitch: s.hitByPitch,
            sacrifices: s.sacrifices,
            strikeouts: s.strikeouts,
            doubles: s.doubles,
            triples: s.triples,
            homeRuns: s.homeRuns,
            stolenBases: s.stolenBases,
            caughtStealing: s.caughtStealing,
            inningsPitched: s.inningsPitched,
            earnedRuns: s.earnedRuns,
            pitchingStrikeouts: s.pitchingStrikeouts,
            pitchingWalks: s.pitchingWalks,
            hitsAllowed: s.hitsAllowed,
          })),
          gameScore: gameScore ? {
            ourScore: gameScore.ourScore,
            theirScore: gameScore.theirScore,
            result: gameScore.ourScore > gameScore.theirScore ? "W" : gameScore.ourScore < gameScore.theirScore ? "L" : "T",
          } : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save stats");
      }

      setSuccess(`Saved ${data.statsCount} player stats to game!`);
      setParsedStats([]);
      setImagePreview(null);
      setImageData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save stats");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-headline text-4xl uppercase tracking-tight text-white mb-2">
          Stats <span className="text-teal">Entry</span>
        </h1>
        <p className="text-white/60 mb-8">
          Enter stats manually or upload a photo for AI extraction
        </p>

        {/* Game Selection */}
        <div className="mb-6">
          <label className="block text-sm font-headline uppercase tracking-wide text-white/70 mb-2">
            Select Game
          </label>
          <select
            value={selectedGameId}
            onChange={(e) => handleGameChange(e.target.value)}
            className="w-full md:w-96 bg-white/5 border border-white/20 text-white px-4 py-3 rounded-lg focus:border-teal focus:ring-2 focus:ring-teal/20 focus:outline-none"
          >
            <option value="">Choose a game...</option>
            {games.map((game) => (
              <option key={game._id} value={game._id} className="bg-dark">
                {formatDate(game.date)} vs {game.opponent}
                {game.hasStats ? " (has stats)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Entry Mode Selection - shown after game is selected */}
        {selectedGameId && entryMode === "select" && (
          <div className="mb-8">
            <label className="block text-sm font-headline uppercase tracking-wide text-white/70 mb-4">
              How do you want to enter stats?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
              {/* Edit Existing Stats - only show if game has stats */}
              {games.find((g) => g._id === selectedGameId)?.hasStats && (
                <button
                  onClick={handleLoadExistingStats}
                  disabled={loading}
                  className="flex items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-purple-500/50 transition-colors text-left group disabled:opacity-50"
                >
                  <div className="w-14 h-14 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-headline text-lg uppercase tracking-tight text-white">
                      {loading ? "Loading..." : "Edit Existing"}
                    </h3>
                    <p className="text-white/50 text-sm mt-1">
                      Modify current stats
                    </p>
                  </div>
                </button>
              )}

              {/* Manual Entry Option */}
              <button
                onClick={handleStartManualEntry}
                className="flex items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-teal/50 transition-colors text-left group"
              >
                <div className="w-14 h-14 bg-teal/20 rounded-lg flex items-center justify-center text-teal group-hover:bg-teal group-hover:text-dark transition-colors">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-headline text-lg uppercase tracking-tight text-white">
                    Manual Entry
                  </h3>
                  <p className="text-white/50 text-sm mt-1">
                    Type in stats for each player
                  </p>
                </div>
              </button>

              {/* AI Image Upload Option */}
              <button
                onClick={() => setEntryMode("image")}
                className="flex items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-orange/50 transition-colors text-left group"
              >
                <div className="w-14 h-14 bg-orange/20 rounded-lg flex items-center justify-center text-orange group-hover:bg-orange group-hover:text-dark transition-colors">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-headline text-lg uppercase tracking-tight text-white">
                    Image Upload
                  </h3>
                  <p className="text-white/50 text-sm mt-1">
                    AI extracts stats from photo
                  </p>
                </div>
              </button>
            </div>

            {/* Clear Stats Button - only show if game has stats */}
            {games.find((g) => g._id === selectedGameId)?.hasStats && (
              <div className="mt-6">
                <button
                  onClick={() => setShowClearModal(true)}
                  className="text-pink hover:text-pink/80 text-sm transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear all stats for this game
                </button>
              </div>
            )}
          </div>
        )}

        {/* Image Upload - shown when image mode selected */}
        {selectedGameId && entryMode === "image" && !parsedStats.length && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-headline uppercase tracking-wide text-white/70">
                Stat Sheet Photo
              </label>
              <button
                onClick={() => setEntryMode("select")}
                className="text-white/50 hover:text-white text-sm transition-colors"
              >
                &larr; Back to options
              </button>
            </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleImageDrop}
              className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-teal/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Stat sheet preview"
                  className="max-h-96 mx-auto rounded-lg"
                />
              ) : (
                <div className="text-white/50">
                  <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-headline uppercase tracking-wide">Drop image here or click to upload</p>
                  <p className="text-sm mt-1">Supports JPG, PNG</p>
                </div>
              )}
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Parse Button */}
            {imageData && (
              <div className="mt-6">
                <button
                  onClick={handleParse}
                  disabled={loading}
                  className="bg-teal text-dark py-3 px-8 rounded-lg font-headline uppercase tracking-wide hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Analyzing with AI..." : "Extract Stats with AI"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-pink/10 border border-pink/20 p-4 rounded-lg text-pink">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-teal/10 border border-teal/20 p-4 rounded-lg text-teal">
            {success}
          </div>
        )}

        {/* Game Score */}
        {gameScore && (
          <div className="mb-6 bg-white/5 border border-white/10 p-4 rounded-lg">
            <h3 className="font-headline uppercase tracking-wide text-white/70 mb-2">Detected Score</h3>
            <div className="flex items-center gap-4">
              <div>
                <label className="text-xs text-white/50">Us</label>
                <input
                  type="number"
                  value={gameScore.ourScore}
                  onChange={(e) => setGameScore({ ...gameScore, ourScore: parseInt(e.target.value) || 0 })}
                  className="w-20 bg-white/5 border border-white/20 text-white text-center px-2 py-1 rounded ml-2"
                />
              </div>
              <span className="text-white/50">-</span>
              <div>
                <label className="text-xs text-white/50">Them</label>
                <input
                  type="number"
                  value={gameScore.theirScore}
                  onChange={(e) => setGameScore({ ...gameScore, theirScore: parseInt(e.target.value) || 0 })}
                  className="w-20 bg-white/5 border border-white/20 text-white text-center px-2 py-1 rounded ml-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Stats Table */}
        {parsedStats.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-xl uppercase tracking-tight text-white">
                {entryMode === "edit" ? (
                  <>Editing Stats <span className="text-purple-400">({parsedStats.length} players)</span></>
                ) : entryMode === "manual" ? (
                  <>Player Stats <span className="text-teal">({parsedStats.length} players)</span></>
                ) : (
                  <>Extracted Stats <span className="text-orange">({parsedStats.length} players)</span></>
                )}
              </h3>
              <div className="flex items-center gap-3">
                {(entryMode === "manual" || entryMode === "edit") && (
                  <button
                    onClick={handleAddPlayer}
                    className="flex items-center gap-1 text-teal hover:text-teal/80 text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Player
                  </button>
                )}
                <button
                  onClick={() => {
                    setEntryMode("select");
                    setParsedStats([]);
                    setGameScore(null);
                  }}
                  className="text-white/50 hover:text-white text-sm transition-colors"
                >
                  &larr; Back to options
                </button>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-headline uppercase tracking-wide text-white/70">Player</th>
                      <th className="px-3 py-2 text-left text-xs font-headline uppercase tracking-wide text-white/70">Match To</th>
                      <th className="px-2 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">PA</th>
                      <th className="px-2 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">AB</th>
                      <th className="px-2 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">1B</th>
                      <th className="px-2 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">2B</th>
                      <th className="px-2 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">3B</th>
                      <th className="px-2 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">HR</th>
                      <th className="px-2 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">H</th>
                      <th className="px-2 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">R</th>
                      <th className="px-2 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">RBI</th>
                      <th className="px-2 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">BB</th>
                      <th className="px-2 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">HBP</th>
                      <th className="px-2 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">SAC</th>
                      <th className="px-2 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">K</th>
                      <th className="px-2 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">SB</th>
                      <th className="px-2 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">CS</th>
                      {(entryMode === "manual" || entryMode === "edit") && (
                        <th className="px-2 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70"></th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {parsedStats.map((stat, index) => (
                      <tr key={index} className="hover:bg-white/5">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="text-white">
                            {stat.jerseyNumber && <span className="text-teal mr-1">#{stat.jerseyNumber}</span>}
                            {stat.playerName}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={stat.matchedPlayerId || ""}
                            onChange={(e) => handlePlayerMatch(index, e.target.value)}
                            className={`w-40 bg-white/5 border text-sm px-2 py-1 rounded ${
                              stat.matchedPlayerId ? "border-teal/50 text-white" : "border-orange/50 text-orange"
                            }`}
                          >
                            <option value="">Select player...</option>
                            {roster.map((player) => (
                              <option key={player._id} value={player._id} className="bg-dark text-white">
                                #{player.jerseyNumber} {player.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={stat.plateAppearances}
                            onChange={(e) => handleStatChange(index, "plateAppearances", parseInt(e.target.value) || 0)}
                            className="w-12 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={stat.atBats}
                            onChange={(e) => handleStatChange(index, "atBats", parseInt(e.target.value) || 0)}
                            className="w-12 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={stat.singles}
                            onChange={(e) => handleStatChange(index, "singles", parseInt(e.target.value) || 0)}
                            className="w-12 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={stat.doubles}
                            onChange={(e) => handleStatChange(index, "doubles", parseInt(e.target.value) || 0)}
                            className="w-12 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={stat.triples}
                            onChange={(e) => handleStatChange(index, "triples", parseInt(e.target.value) || 0)}
                            className="w-12 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={stat.homeRuns}
                            onChange={(e) => handleStatChange(index, "homeRuns", parseInt(e.target.value) || 0)}
                            className="w-12 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={stat.hits}
                            onChange={(e) => handleStatChange(index, "hits", parseInt(e.target.value) || 0)}
                            className="w-12 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={stat.runs}
                            onChange={(e) => handleStatChange(index, "runs", parseInt(e.target.value) || 0)}
                            className="w-12 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={stat.rbi}
                            onChange={(e) => handleStatChange(index, "rbi", parseInt(e.target.value) || 0)}
                            className="w-12 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={stat.walks}
                            onChange={(e) => handleStatChange(index, "walks", parseInt(e.target.value) || 0)}
                            className="w-12 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={stat.hitByPitch}
                            onChange={(e) => handleStatChange(index, "hitByPitch", parseInt(e.target.value) || 0)}
                            className="w-12 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={stat.sacrifices}
                            onChange={(e) => handleStatChange(index, "sacrifices", parseInt(e.target.value) || 0)}
                            className="w-12 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={stat.strikeouts}
                            onChange={(e) => handleStatChange(index, "strikeouts", parseInt(e.target.value) || 0)}
                            className="w-12 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={stat.stolenBases}
                            onChange={(e) => handleStatChange(index, "stolenBases", parseInt(e.target.value) || 0)}
                            className="w-12 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={stat.caughtStealing}
                            onChange={(e) => handleStatChange(index, "caughtStealing", parseInt(e.target.value) || 0)}
                            className="w-12 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm"
                          />
                        </td>
                        {(entryMode === "manual" || entryMode === "edit") && (
                          <td className="px-2 py-2 text-center">
                            <button
                              onClick={() => handleRemovePlayer(index)}
                              className="text-white/30 hover:text-pink transition-colors p-1"
                              title="Remove player"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pitching Stats Section */}
            <div className="mt-6">
              <h3 className="font-headline text-lg uppercase tracking-tight text-white mb-3">
                Pitching Stats <span className="text-white/50 text-sm normal-case">(only fill for players who pitched)</span>
              </h3>
              <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-white/10">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-headline uppercase tracking-wide text-white/70">Player</th>
                        <th className="px-3 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">IP</th>
                        <th className="px-3 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">H</th>
                        <th className="px-3 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">ER</th>
                        <th className="px-3 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">BB</th>
                        <th className="px-3 py-2 text-center text-xs font-headline uppercase tracking-wide text-white/70">K</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {parsedStats.filter((s) => s.matchedPlayerId).map((stat, index) => {
                        const originalIndex = parsedStats.findIndex((p) => p === stat);
                        const matchedPlayer = roster.find((p) => p._id === stat.matchedPlayerId);
                        return (
                          <tr key={index} className="hover:bg-white/5">
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className="text-white">
                                {matchedPlayer && <span className="text-teal mr-1">#{matchedPlayer.jerseyNumber}</span>}
                                {matchedPlayer?.name || stat.playerName}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                step="0.1"
                                value={stat.inningsPitched ?? ""}
                                onChange={(e) => handleStatChange(originalIndex, "inningsPitched", e.target.value === "" ? null : parseFloat(e.target.value))}
                                placeholder="-"
                                className="w-16 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm placeholder:text-white/30"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={stat.hitsAllowed ?? ""}
                                onChange={(e) => handleStatChange(originalIndex, "hitsAllowed", e.target.value === "" ? null : parseInt(e.target.value))}
                                placeholder="-"
                                className="w-16 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm placeholder:text-white/30"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={stat.earnedRuns ?? ""}
                                onChange={(e) => handleStatChange(originalIndex, "earnedRuns", e.target.value === "" ? null : parseInt(e.target.value))}
                                placeholder="-"
                                className="w-16 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm placeholder:text-white/30"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={stat.pitchingWalks ?? ""}
                                onChange={(e) => handleStatChange(originalIndex, "pitchingWalks", e.target.value === "" ? null : parseInt(e.target.value))}
                                placeholder="-"
                                className="w-16 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm placeholder:text-white/30"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={stat.pitchingStrikeouts ?? ""}
                                onChange={(e) => handleStatChange(originalIndex, "pitchingStrikeouts", e.target.value === "" ? null : parseInt(e.target.value))}
                                placeholder="-"
                                className="w-16 bg-white/5 border border-white/20 text-white text-center px-1 py-1 rounded text-sm placeholder:text-white/30"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {parsedStats.filter((s) => s.matchedPlayerId).length === 0 && (
                  <div className="px-4 py-6 text-center text-white/50 text-sm">
                    Match players above to enter pitching stats
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-6">
              <button
                onClick={handleSave}
                disabled={saving || !selectedGameId}
                className="bg-orange text-dark py-3 px-8 rounded-lg font-headline uppercase tracking-wide hover:bg-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : "Save Stats to Game"}
              </button>
              <p className="text-white/50 text-sm mt-2">
                {parsedStats.filter((s) => s.matchedPlayerId).length} of {parsedStats.length} players matched
              </p>
            </div>
          </div>
        )}

        {/* Clear Stats Confirmation Modal */}
        {showClearModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-dark border border-white/20 rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-headline text-xl uppercase tracking-tight text-white">
                  Clear All Stats?
                </h3>
              </div>
              <p className="text-white/70 mb-6">
                This will permanently delete all player stats and the game score for this game. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClearModal(false)}
                  disabled={clearing}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearStats}
                  disabled={clearing}
                  className="px-4 py-2 bg-pink text-white rounded-lg hover:bg-pink/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {clearing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Clearing...
                    </>
                  ) : (
                    "Clear All Stats"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
