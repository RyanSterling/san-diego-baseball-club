import { defineField, defineType } from "sanity";

export default defineType({
  name: "season",
  title: "Season",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: 'e.g., "Spring 2025"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "isCurrent",
      title: "Is Current Season",
      type: "boolean",
      description: "Mark as current season (only one should be true)",
      initialValue: false,
    }),
    defineField({
      name: "teamFundTotal",
      title: "Team Fund Total",
      type: "number",
      description: "Total amount needed for the season (e.g., league fees, equipment)",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "playerPayments",
      title: "Player Payments",
      type: "array",
      description: "Track how much each player has paid toward the team fund",
      of: [
        {
          type: "object",
          name: "playerPayment",
          fields: [
            {
              name: "player",
              title: "Player",
              type: "reference",
              to: [{ type: "player" }],
              validation: (rule) => rule.required(),
            },
            {
              name: "amountPaid",
              title: "Amount Paid",
              type: "number",
              validation: (rule) => rule.required().min(0),
            },
          ],
          preview: {
            select: {
              playerName: "player.name",
              playerNumber: "player.jerseyNumber",
              amount: "amountPaid",
            },
            prepare({ playerName, playerNumber, amount }) {
              return {
                title: playerName ? `#${playerNumber} ${playerName}` : "Select player",
                subtitle: amount ? `$${amount.toFixed(2)}` : "$0.00",
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      isCurrent: "isCurrent",
    },
    prepare({ title, isCurrent }) {
      return {
        title: title,
        subtitle: isCurrent ? "Current Season" : "",
      };
    },
  },
});
