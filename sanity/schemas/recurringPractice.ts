import { defineField, defineType } from "sanity";

export default defineType({
  name: "recurringPractice",
  title: "Practice Schedule",
  type: "document",
  fields: [
    defineField({
      name: "dayOfWeek",
      title: "Day of Week",
      type: "string",
      options: {
        list: [
          { title: "Sunday", value: "0" },
          { title: "Monday", value: "1" },
          { title: "Tuesday", value: "2" },
          { title: "Wednesday", value: "3" },
          { title: "Thursday", value: "4" },
          { title: "Friday", value: "5" },
          { title: "Saturday", value: "6" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "time",
      title: "Time",
      type: "string",
      description: "e.g., 2:00 PM, 8:30 AM",
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
      rows: 2,
      description: "Optional notes (e.g., bring batting gloves)",
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      description: "Uncheck to temporarily disable this practice",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      day: "dayOfWeek",
      time: "time",
      location: "location",
    },
    prepare({ day, time, location }) {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = days[parseInt(day)] || day;
      return {
        title: `${dayName}s @ ${time}`,
        subtitle: location,
      };
    },
  },
});
