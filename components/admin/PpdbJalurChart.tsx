"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { colors } from "@/lib/tokens";

export function PpdbJalurChart({
  data,
}: {
  data: { jalur: string; jumlah: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(89,39,32,0.08)" />
          <XAxis
            dataKey="jalur"
            tick={{ fontSize: 12, fill: colors.neutral.slate }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: colors.neutral.slate }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 8px 24px rgba(89,39,32,0.12)",
              fontSize: 13,
            }}
          />
          <Bar dataKey="jumlah" fill={colors.primary.teal} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
