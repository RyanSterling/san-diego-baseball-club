"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { ChartContainer } from "./ChartContainer";
import type { BattingProgressPoint } from "@/lib/stats/chartHelpers";
import { formatChartAvg, formatChartDate } from "@/lib/stats/chartHelpers";

interface PlayerProgressChartProps {
  data: BattingProgressPoint[];
  playerName: string;
}

export function PlayerProgressChart({
  data,
  playerName,
}: PlayerProgressChartProps) {
  if (data.length < 3) {
    return null;
  }

  // Get min/max for Y axis domain
  const minAvg = Math.min(...data.map((d) => d.avg));
  const maxAvg = Math.max(...data.map((d) => d.avg));
  const yMin = Math.max(0, Math.floor(minAvg * 10) / 10 - 0.05);
  const yMax = Math.min(1, Math.ceil(maxAvg * 10) / 10 + 0.05);

  return (
    <ChartContainer
      title="Batting Average"
      subtitle="Season progression"
      height={250}
    >
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <XAxis
          dataKey="gameNumber"
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tickLine={false}
          label={{
            value: "Game",
            position: "insideBottom",
            offset: -5,
            fill: "rgba(255,255,255,0.3)",
            fontSize: 10,
          }}
        />
        <YAxis
          domain={[yMin, yMax]}
          tickFormatter={(v) => formatChartAvg(v)}
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={45}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#171717",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 0,
          }}
          labelStyle={{ color: "#fff", marginBottom: 4 }}
          labelFormatter={(label, payload) => {
            if (payload?.[0]?.payload) {
              const point = payload[0].payload as BattingProgressPoint;
              return `Game ${label}: vs ${point.opponent} (${formatChartDate(point.date)})`;
            }
            return `Game ${label}`;
          }}
          formatter={(value, _name, props) => {
            const point = props.payload as BattingProgressPoint;
            return [
              `${formatChartAvg(value as number)} (${point.cumulativeHits}/${point.cumulativeAtBats})`,
              "AVG",
            ];
          }}
        />
        <ReferenceLine
          y={0.25}
          stroke="rgba(255,255,255,0.2)"
          strokeDasharray="3 3"
          label={{
            value: ".250",
            fill: "rgba(255,255,255,0.3)",
            fontSize: 10,
            position: "right",
          }}
        />
        <Line
          type="monotone"
          dataKey="avg"
          stroke="#9BD4D1"
          strokeWidth={2}
          dot={{ fill: "#9BD4D1", strokeWidth: 0, r: 4 }}
          activeDot={{ fill: "#E68528", strokeWidth: 0, r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
