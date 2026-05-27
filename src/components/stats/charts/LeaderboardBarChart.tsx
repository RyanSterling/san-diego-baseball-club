"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from "recharts";
import { ChartContainer } from "./ChartContainer";
import type { LeaderboardEntry } from "@/lib/stats/chartHelpers";
import { formatChartAvg } from "@/lib/stats/chartHelpers";

interface LeaderboardBarChartProps {
  data: LeaderboardEntry[];
  title: string;
  subtitle?: string;
  statType?: "avg" | "count";
}

const COLORS = {
  1: "#E68528", // orange - 1st place
  2: "#9BD4D1", // teal - 2nd place
  3: "#ED4380", // pink - 3rd place
  default: "rgba(255,255,255,0.3)",
};

export function LeaderboardBarChart({
  data,
  title,
  subtitle,
  statType = "avg",
}: LeaderboardBarChartProps) {
  if (data.length === 0) {
    return null;
  }

  const formatValue = (value: number) => {
    if (statType === "avg") {
      return formatChartAvg(value);
    }
    return value.toString();
  };

  return (
    <ChartContainer title={title} subtitle={subtitle} height={200}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 60, left: 0, bottom: 5 }}
      >
        <XAxis
          type="number"
          domain={statType === "avg" ? [0, 0.5] : [0, "auto"]}
          hide
        />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#171717",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 0,
          }}
          labelStyle={{ color: "#fff" }}
          formatter={(value) => [formatValue(value as number), title]}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.slug}
              fill={COLORS[entry.rank as keyof typeof COLORS] || COLORS.default}
            />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(value) => formatValue(value as number)}
            fill="rgba(255,255,255,0.8)"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
