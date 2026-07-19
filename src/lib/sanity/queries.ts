import { groq } from "next-sanity";

// Site Settings
export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    teamName,
    tagline,
    logo,
    defaultGameChangerUrl,
    contactEmail,
    socialLinks
  }
`;

// Seasons
export const currentSeasonQuery = groq`
  *[_type == "season" && isCurrent == true][0] {
    _id,
    name,
    "slug": slug.current,
    startDate,
    endDate
  }
`;

export const allSeasonsQuery = groq`
  *[_type == "season"] | order(startDate desc) {
    _id,
    name,
    "slug": slug.current,
    startDate,
    endDate,
    isCurrent
  }
`;

// Get season by slug
export const seasonBySlugQuery = groq`
  *[_type == "season" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    startDate,
    endDate,
    isCurrent
  }
`;

// Get games by season slug
export const gamesBySeasonSlugQuery = groq`
  *[_type == "game" && season->slug.current == $seasonSlug] | order(date asc) {
    _id,
    "slug": slug.current,
    date,
    opponent,
    location,
    homeOrAway,
    result,
    ourScore,
    theirScore,
    "hasRecap": defined(recap)
  }
`;

// Get games with stats by season slug (for roster stats)
export const gamesWithStatsBySeasonSlugQuery = groq`
  *[_type == "game" && season->slug.current == $seasonSlug && defined(playerStats)] | order(date asc) {
    _id,
    date,
    opponent,
    playerStats[]{
      player->{
        _id,
        name,
        "slug": slug.current,
        jerseyNumber,
        position
      },
      atBats,
      hits,
      runs,
      rbi,
      walks,
      strikeouts,
      doubles,
      triples,
      homeRuns,
      stolenBases,
      inningsPitched,
      earnedRuns,
      pitchingStrikeouts,
      pitchingWalks,
      hitsAllowed
    }
  }
`;

// Players
export const activePlayersQuery = groq`
  *[_type == "player" && isActive == true] | order(jerseyNumber asc) {
    _id,
    name,
    "slug": slug.current,
    jerseyNumber,
    position,
    photo,
    bio,
    battingSide,
    throwingSide
  }
`;

// Players by season slug
export const playersBySeasonSlugQuery = groq`
  *[_type == "player" && isActive == true && $seasonSlug in seasons[]->slug.current] | order(jerseyNumber asc) {
    _id,
    name,
    "slug": slug.current,
    jerseyNumber,
    position,
    photo,
    bio,
    battingSide,
    throwingSide
  }
`;

export const playerBySlugQuery = groq`
  *[_type == "player" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    jerseyNumber,
    position,
    photo,
    bio,
    battingSide,
    throwingSide,
    isActive
  }
`;

// Games
export const gamesBySeasonQuery = groq`
  *[_type == "game" && season._ref == $seasonId] | order(date asc) {
    _id,
    "slug": slug.current,
    date,
    opponent,
    location,
    homeOrAway,
    result,
    ourScore,
    theirScore,
    gameChangerLink,
    "hasRecap": defined(recap)
  }
`;

export const upcomingGamesQuery = groq`
  *[_type == "game" && date > now()] | order(date asc) [0...5] {
    _id,
    "slug": slug.current,
    date,
    opponent,
    location,
    homeOrAway,
    season->{name}
  }
`;

export const nextGameQuery = groq`
  *[_type == "game" && date > now()] | order(date asc) [0] {
    _id,
    "slug": slug.current,
    date,
    opponent,
    location,
    homeOrAway,
    season->{name}
  }
`;

export const recentGameQuery = groq`
  *[_type == "game" && date < now() && defined(result)] | order(date desc) [0] {
    _id,
    "slug": slug.current,
    date,
    opponent,
    result,
    ourScore,
    theirScore,
    "hasRecap": defined(recap)
  }
`;

export const gameBySlugQuery = groq`
  *[_type == "game" && slug.current == $slug][0] {
    _id,
    "slug": slug.current,
    date,
    opponent,
    location,
    homeOrAway,
    result,
    ourScore,
    theirScore,
    recap,
    gameChangerLink,
    ourInnings,
    theirInnings,
    ourHits,
    theirHits,
    ourErrors,
    theirErrors,
    season->{name, "slug": slug.current},
    playerStats[]{
      player->{
        _id,
        name,
        "slug": slug.current,
        jerseyNumber,
        position
      },
      plateAppearances,
      atBats,
      hits,
      runs,
      rbi,
      walks,
      strikeouts,
      doubles,
      triples,
      homeRuns,
      stolenBases,
      inningsPitched,
      earnedRuns,
      pitchingStrikeouts,
      pitchingWalks,
      hitsAllowed
    }
  }
`;

// Practices
export const practicesBySeasonQuery = groq`
  *[_type == "practice" && season._ref == $seasonId] | order(date asc) {
    _id,
    date,
    location,
    notes
  }
`;

export const nextPracticeQuery = groq`
  *[_type == "practice" && date > now()] | order(date asc) [0] {
    _id,
    date,
    location,
    notes,
    season->{name}
  }
`;

// Player Stats (embedded in games)
// Get all games with player stats for a season (used for leaderboards)
export const gamesWithStatsQuery = groq`
  *[_type == "game" && season._ref == $seasonId && defined(playerStats)] | order(date asc) {
    _id,
    date,
    opponent,
    playerStats[]{
      player->{
        _id,
        name,
        "slug": slug.current,
        jerseyNumber
      },
      atBats,
      hits,
      runs,
      rbi,
      walks,
      strikeouts,
      doubles,
      triples,
      homeRuns,
      stolenBases,
      inningsPitched,
      earnedRuns,
      pitchingStrikeouts,
      pitchingWalks,
      hitsAllowed
    }
  }
`;

// Get stats for a specific player across a season
export const playerSeasonGamesQuery = groq`
  *[_type == "game" && season._ref == $seasonId && defined(playerStats)] | order(date asc) {
    _id,
    date,
    opponent,
    "playerStat": playerStats[player._ref == $playerId][0]{
      plateAppearances,
      atBats,
      hits,
      runs,
      rbi,
      walks,
      strikeouts,
      doubles,
      triples,
      homeRuns,
      stolenBases,
      hitByPitch,
      sacrifices,
      inningsPitched,
      earnedRuns,
      pitchingStrikeouts,
      pitchingWalks,
      hitsAllowed
    }
  }
`;

// Get stats for a specific player across a season (by slug)
export const playerSeasonGamesBySlugQuery = groq`
  *[_type == "game" && season->slug.current == $seasonSlug && defined(playerStats)] | order(date asc) {
    _id,
    "slug": slug.current,
    date,
    opponent,
    "playerStat": playerStats[player._ref == $playerId][0]{
      plateAppearances,
      atBats,
      hits,
      runs,
      rbi,
      walks,
      strikeouts,
      doubles,
      triples,
      homeRuns,
      stolenBases,
      hitByPitch,
      sacrifices,
      inningsPitched,
      earnedRuns,
      pitchingStrikeouts,
      pitchingWalks,
      hitsAllowed
    }
  }
`;

// Recurring Practices
export const recurringPracticesQuery = groq`
  *[_type == "recurringPractice" && isActive == true] | order(dayOfWeek asc) {
    _id,
    dayOfWeek,
    time,
    location,
    notes
  }
`;

// Current season games (all games for the current season)
export const currentSeasonGamesQuery = groq`
  *[_type == "game" && season->isCurrent == true] | order(date asc) {
    _id,
    "slug": slug.current,
    date,
    opponent,
    location,
    homeOrAway,
    result,
    ourScore,
    theirScore,
    "hasRecap": defined(recap)
  }
`;

// Games with stats for current season (for roster stats)
export const currentSeasonStatsQuery = groq`
  *[_type == "game" && season->isCurrent == true && defined(playerStats)] | order(date asc) {
    _id,
    date,
    opponent,
    playerStats[]{
      player->{
        _id,
        name,
        "slug": slug.current,
        jerseyNumber,
        position
      },
      atBats,
      hits,
      runs,
      rbi,
      walks,
      strikeouts,
      doubles,
      triples,
      homeRuns,
      stolenBases
    }
  }
`;

// Games with scores for charts (no player stats needed)
export const gameScoresBySeasonSlugQuery = groq`
  *[_type == "game" && season->slug.current == $seasonSlug && defined(ourScore)] | order(date asc) {
    _id,
    date,
    opponent,
    result,
    ourScore,
    theirScore
  }
`;

// Fund Entries
export const fundEntriesQuery = groq`
  *[_type == "fundEntry"] | order(date asc) {
    _id,
    date,
    description,
    amount,
    type
  }
`;

// Season fund data with player payments
export const currentSeasonFundQuery = groq`
  *[_type == "season" && isCurrent == true][0] {
    _id,
    name,
    "slug": slug.current,
    teamFundTotal,
    playerPayments[]{
      player->{
        _id,
        name,
        jerseyNumber
      },
      amountPaid
    }
  }
`;

// Recent games for stats entry (games from current season, ordered by date)
export const recentGamesForStatsQuery = groq`
  *[_type == "game" && season->isCurrent == true] | order(date desc) [0...20] {
    _id,
    "slug": slug.current,
    date,
    opponent,
    homeOrAway,
    result,
    ourScore,
    theirScore,
    "hasStats": defined(playerStats) && count(playerStats) > 0
  }
`;
