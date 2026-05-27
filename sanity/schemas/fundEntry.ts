import { defineField, defineType } from "sanity";

export default defineType({
  name: "fundEntry",
  title: "Fund Entry",
  type: "document",
  fields: [
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "amount",
      title: "Amount",
      type: "number",
      description: "Enter positive number (type determines in/out)",
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Money In", value: "in" },
          { title: "Money Out", value: "out" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
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
      description: "description",
      amount: "amount",
      type: "type",
    },
    prepare({ date, description, amount, type }) {
      const prefix = type === "in" ? "+" : "-";
      return {
        title: description,
        subtitle: `${date} | ${prefix}$${amount?.toFixed(2) || "0.00"}`,
      };
    },
  },
});
