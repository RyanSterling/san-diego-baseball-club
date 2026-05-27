import { defineField, defineType } from "sanity";

export default defineType({
  name: "player",
  title: "Player",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
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
      name: "jerseyNumber",
      title: "Jersey Number",
      type: "number",
      validation: (rule) => rule.required().min(0).max(99),
    }),
    defineField({
      name: "position",
      title: "Position",
      type: "string",
      options: {
        list: [
          { title: "Pitcher", value: "P" },
          { title: "Catcher", value: "C" },
          { title: "First Base", value: "1B" },
          { title: "Second Base", value: "2B" },
          { title: "Third Base", value: "3B" },
          { title: "Shortstop", value: "SS" },
          { title: "Left Field", value: "LF" },
          { title: "Center Field", value: "CF" },
          { title: "Right Field", value: "RF" },
          { title: "Designated Hitter", value: "DH" },
          { title: "Utility", value: "UTIL" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "battingSide",
      title: "Batting Side",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "L" },
          { title: "Right", value: "R" },
          { title: "Switch", value: "S" },
        ],
      },
    }),
    defineField({
      name: "throwingSide",
      title: "Throwing Side",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "L" },
          { title: "Right", value: "R" },
        ],
      },
    }),
    defineField({
      name: "seasons",
      title: "Seasons",
      type: "array",
      of: [{ type: "reference", to: [{ type: "season" }] }],
      description: "Which seasons this player is/was on the roster",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      description: "Uncheck to hide player completely (retired, left team, etc.)",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "name",
      number: "jerseyNumber",
      position: "position",
      media: "photo",
    },
    prepare({ title, number, position, media }) {
      return {
        title: `#${number} ${title}`,
        subtitle: position,
        media,
      };
    },
  },
});
