import { defineField, defineType } from "sanity";

export default defineType({
  name: "practice",
  title: "Practice",
  type: "document",
  fields: [
    defineField({
      name: "season",
      title: "Season",
      type: "reference",
      to: [{ type: "season" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date & Time",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 3,
      description: "Optional notes about practice (e.g., bring batting gloves)",
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
      date: "date",
      location: "location",
    },
    prepare({ date, location }) {
      const dateStr = date ? new Date(date).toLocaleDateString() : "";
      const timeStr = date
        ? new Date(date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
        : "";
      return {
        title: `Practice - ${dateStr}`,
        subtitle: `${timeStr} @ ${location}`,
      };
    },
  },
});
