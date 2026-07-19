import { defineField, defineType, defineArrayMember } from "sanity";

export default defineType({
  name: "game",
  title: "Game",
  type: "document",
  groups: [
    { name: "info", title: "Game Info", default: true },
    { name: "result", title: "Result & Recap" },
    { name: "boxscore", title: "Box Score" },
    { name: "stats", title: "Player Stats" },
  ],
  fields: [
    defineField({
      name: "season",
      title: "Season",
      type: "reference",
      to: [{ type: "season" }],
      validation: (rule) => rule.required(),
      group: "info",
    }),
    defineField({
      name: "date",
      title: "Date & Time",
      type: "datetime",
      validation: (rule) => rule.required(),
      group: "info",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: (doc) => {
          const date = doc.date ? new Date(doc.date as string).toISOString().split("T")[0] : "";
          return `${doc.opponent}-${date}`;
        },
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
      group: "info",
    }),
    defineField({
      name: "opponent",
      title: "Opponent",
      type: "string",
      validation: (rule) => rule.required(),
      group: "info",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      validation: (rule) => rule.required(),
      group: "info",
    }),
    defineField({
      name: "homeOrAway",
      title: "Home or Away",
      type: "string",
      options: {
        list: [
          { title: "Home", value: "home" },
          { title: "Away", value: "away" },
        ],
        layout: "radio",
      },
      initialValue: "home",
      group: "info",
    }),
    defineField({
      name: "result",
      title: "Result",
      type: "string",
      description: "Fill in after game is played",
      options: {
        list: [
          { title: "Win", value: "W" },
          { title: "Loss", value: "L" },
          { title: "Tie", value: "T" },
        ],
      },
      group: "result",
    }),
    defineField({
      name: "ourScore",
      title: "Our Score",
      type: "number",
      description: "Fill in after game is played",
      group: "result",
    }),
    defineField({
      name: "theirScore",
      title: "Their Score",
      type: "number",
      description: "Fill in after game is played",
      group: "result",
    }),
    defineField({
      name: "recap",
      title: "Game Recap",
      type: "array",
      of: [{ type: "block" }],
      description: "Write a recap after the game",
      group: "result",
    }),
    defineField({
      name: "gameChangerLink",
      title: "GameChanger Link",
      type: "url",
      description: "Link to GameChanger box score (optional)",
      group: "result",
    }),
    // Box Score - inning by inning
    defineField({
      name: "ourInnings",
      title: "Our Runs by Inning",
      type: "array",
      of: [{ type: "number" }],
      description: "Enter runs scored each inning (e.g., 0, 0, 0, 4, 0, 0, 0, 3, 4 = 11 runs)",
      group: "boxscore",
    }),
    defineField({
      name: "theirInnings",
      title: "Their Runs by Inning",
      type: "array",
      of: [{ type: "number" }],
      description: "Enter opponent's runs each inning",
      group: "boxscore",
    }),
    defineField({
      name: "ourHits",
      title: "Our Hits",
      type: "number",
      description: "Total team hits (can be calculated from player stats if left blank)",
      group: "boxscore",
    }),
    defineField({
      name: "theirHits",
      title: "Their Hits",
      type: "number",
      group: "boxscore",
    }),
    defineField({
      name: "ourErrors",
      title: "Our Errors",
      type: "number",
      initialValue: 0,
      group: "boxscore",
    }),
    defineField({
      name: "theirErrors",
      title: "Their Errors",
      type: "number",
      initialValue: 0,
      group: "boxscore",
    }),
    // Player Stats - embedded array
    defineField({
      name: "playerStats",
      title: "Player Stats",
      type: "array",
      group: "stats",
      description: "Add stats for each player who played in this game",
      of: [
        defineArrayMember({
          type: "object",
          name: "playerStat",
          title: "Player Stat",
          fields: [
            defineField({
              name: "player",
              title: "Player",
              type: "reference",
              to: [{ type: "player" }],
              validation: (rule) => rule.required(),
            }),
            // Batting stats
            defineField({
              name: "plateAppearances",
              title: "PA",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "atBats",
              title: "AB",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "singles",
              title: "1B",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "hits",
              title: "H",
              type: "number",
              description: "Total hits (1B+2B+3B+HR)",
              initialValue: 0,
            }),
            defineField({
              name: "runs",
              title: "R",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "rbi",
              title: "RBI",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "walks",
              title: "BB",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "strikeouts",
              title: "K",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "doubles",
              title: "2B",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "triples",
              title: "3B",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "homeRuns",
              title: "HR",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "stolenBases",
              title: "SB",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "caughtStealing",
              title: "CS",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "hitByPitch",
              title: "HBP",
              type: "number",
              initialValue: 0,
            }),
            defineField({
              name: "sacrifices",
              title: "SAC",
              type: "number",
              initialValue: 0,
            }),
            // Pitching stats (optional - only fill if player pitched)
            defineField({
              name: "inningsPitched",
              title: "IP",
              type: "number",
              description: "Leave blank if didn't pitch",
            }),
            defineField({
              name: "earnedRuns",
              title: "ER",
              type: "number",
            }),
            defineField({
              name: "pitchingStrikeouts",
              title: "K (pitching)",
              type: "number",
            }),
            defineField({
              name: "pitchingWalks",
              title: "BB (pitching)",
              type: "number",
            }),
            defineField({
              name: "hitsAllowed",
              title: "H Allowed",
              type: "number",
            }),
          ],
          preview: {
            select: {
              playerName: "player.name",
              playerNumber: "player.jerseyNumber",
              hits: "hits",
              atBats: "atBats",
              inningsPitched: "inningsPitched",
            },
            prepare({ playerName, playerNumber, hits, atBats, inningsPitched }) {
              const batting = `${hits || 0}/${atBats || 0}`;
              const pitching = inningsPitched ? ` | ${inningsPitched} IP` : "";
              return {
                title: `#${playerNumber || "?"} ${playerName || "Select player"}`,
                subtitle: `${batting}${pitching}`,
              };
            },
          },
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: "Date, Newest First",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
    {
      title: "Date, Oldest First",
      name: "dateAsc",
      by: [{ field: "date", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      opponent: "opponent",
      date: "date",
      result: "result",
      ourScore: "ourScore",
      theirScore: "theirScore",
    },
    prepare({ opponent, date, result, ourScore, theirScore }) {
      const dateStr = date ? new Date(date).toLocaleDateString() : "";
      const score = ourScore !== undefined && theirScore !== undefined
        ? `${ourScore}-${theirScore}`
        : "";
      return {
        title: `vs ${opponent}`,
        subtitle: `${dateStr} ${result ? `(${result} ${score})` : ""}`.trim(),
      };
    },
  },
});
