"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from "recharts";
import { ChartContainer } from "./ChartContainer";
import type { TeamGamePoint } from "@/lib/stats/chartHelpers";
import { formatChartDate } from "@/lib/stats/chartHelpers";

interface TeamRunsChartProps {
  data: TeamGamePoint[];
  title?: string;
  subtitle?: string;
}

const RESULT_COLORS = {
  W: "#22C55E", // green
  L: "#EF4444", // red
  T: "#9CA3AF", // gray
  null: "rgba(255,255,255,0.3)",
};

export function TeamRunsChart({
  data,
  title = "Runs Per Game",
  subtitle,
}: TeamRunsChartProps) {
  if (data.length === 0) {
    return null;
  }

  // Calculate average runs for reference line
  const avgRuns = data.reduce((sum, g) => sum + g.runsScored, 0) / data.length;

  return (
    <ChartContainer title={title} subtitle={subtitle} height={200}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <XAxis
          dataKey="gameNumber"
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#171717",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 0,
          }}
          labelStyle={{ color: "#fff" }}
          labelFormatter={(label, payload) => {
            if (payload?.[0]?.payload) {
              const game = payload[0].payload as TeamGamePoint;
              return `Game ${label} vs ${game.opponent} (${formatChartDate(game.date)})`;
            }
            return `Game ${label}`;
          }}
          formatter={(value, name) => {
            const displayName = name === "runsScored" ? "Runs" : String(name);
            return [value as number, displayName];
          }}
        />
        <ReferenceLine
          y={avgRuns}
          stroke="#9BD4D1"
          strokeDasharray="3 3"
          label={{
            value: `Avg: ${avgRuns.toFixed(1)}`,
            fill: "#9BD4D1",
            fontSize: 10,
            position: "right",
          }}
        />
        <Bar dataKey="runsScored" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={RESULT_COLORS[entry.result as keyof typeof RESULT_COLORS] || RESULT_COLORS.null}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
