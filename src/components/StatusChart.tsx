import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useApplicants } from "@/utils/ApplicantsContext";
import { useMemo, useRef } from "react";

const FIELD_BASE: Record<string, number> = {
  status: 190, // cyan
  school: 120, // green
  age: 30, // orange
  gender: 280, // purple
};

type StatusChartProps = {
  title: string;
  field: keyof {
    status: string;
    school: string;
    age: string;
    gender: string;
  };
  formatter?: (label: string) => string;
};

function generateShade(baseHue: number, index: number, total: number) {
  const lightness = 35 + (index / Math.max(total - 1, 1)) * 30;
  const saturation = 65;
  return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
}
export default function StatusChart({
  title,
  field,
  formatter,
}: StatusChartProps) {
  const { applicants } = useApplicants();

  const colorMapRef = useRef<Record<string, string>>({});

  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    applicants.forEach((a) => {
      const key = (a[field] ?? "unknown") as string;
      counts[key] = (counts[key] || 0) + 1;
    });

    const entries = Object.entries(counts);
    const total = entries.length;
    const baseHue = FIELD_BASE[field] ?? 200;

    return entries.map(([name, value], index) => {
      if (!colorMapRef.current[name]) {
        colorMapRef.current[name] = generateShade(baseHue, index, total);
      }
      return {
        name: formatter ? formatter(name) : name,
        value,
        color: colorMapRef.current[name],
      };
    });
  }, [applicants, field, formatter]);

  return (
    <div className="flex flex-col items-center w-full h-70">
      <h2 className="mb-2 font-semibold">{title}</h2>
      {data.length === 0 ? (
        <span className="text-gray-400">No data</span>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              dataKey="value"
              nameKey="name"
              stroke="none"
              label={({
                percent,
              }: {
                name?: string;
                value?: number;
                percent?: number;
              }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
