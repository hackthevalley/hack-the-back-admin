import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApplicantProps } from "@/utils/applicants-context";
import { useApplicants } from "@/utils/useApplicants";

const DISTINCT_COLORS = [
  "#2563EB",
  "#DC2626",
  "#16A34A",
  "#EA580C",
  "#9333EA",
  "#0891B2",
  "#DB2777",
  "#65A30D",
  "#4F46E5",
  "#D97706",
  "#0D9488",
  "#7C3AED",
];

type ChartField = keyof Pick<
  ApplicantProps,
  "gender" | "level_of_study" | "school" | "status"
>;

type ChartDatum = {
  name: string;
  value: number;
  color: string;
};

export default function StatusChart({
  title,
  field,
  maxCategories,
}: {
  title: string;
  field: ChartField;
  maxCategories?: number;
}) {
  const { applicants, isLoadingApplicants } = useApplicants();
  const data = useMemo(
    () => aggregateApplicants(applicants, field, maxCategories),
    [applicants, field, maxCategories],
  );
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-baseline justify-between gap-4">
          <CardTitle className="text-lg">{title}</CardTitle>
          <span className="shrink-0 text-sm text-muted-foreground">
            {total.toLocaleString()} total
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoadingApplicants ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            Loading chart…
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            No applicant data
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 items-center gap-4 xl:grid-cols-[minmax(220px,1fr)_minmax(180px,0.8fr)]">
            <div className="h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="48%"
                    outerRadius="78%"
                    paddingAngle={1}
                    stroke="hsl(var(--card))"
                    strokeWidth={2}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      Number(value ?? 0).toLocaleString(),
                      String(name),
                    ]}
                    contentStyle={{
                      borderRadius: "0.5rem",
                      borderColor: "hsl(var(--border))",
                      background: "hsl(var(--popover))",
                      color: "hsl(var(--popover-foreground))",
                    }}
                  />
                  <text
                    x="50%"
                    y="48%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-2xl font-semibold"
                  >
                    {total.toLocaleString()}
                  </text>
                  <text
                    x="50%"
                    y="58%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-xs"
                  >
                    applicants
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {data.map((entry) => (
                <li
                  key={entry.name}
                  className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-sm"
                >
                  <span
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate" title={entry.name}>
                    {entry.name}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {entry.value} ({Math.round((entry.value / total) * 100)}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function aggregateApplicants(
  applicants: ApplicantProps[],
  field: ChartField,
  maxCategories?: number,
): ChartDatum[] {
  const counts = new Map<string, { name: string; value: number }>();
  for (const applicant of applicants) {
    const label = normalizeLabel(applicant[field], field);
    const key = label.toLocaleLowerCase();
    const existing = counts.get(key);
    counts.set(key, {
      name: existing?.name ?? label,
      value: (existing?.value ?? 0) + 1,
    });
  }

  const entries = Array.from(counts.values()).sort(
    (left, right) => right.value - left.value || left.name.localeCompare(right.name),
  );
  const visible =
    maxCategories && entries.length > maxCategories
      ? [
          ...entries.slice(0, maxCategories - 1),
          {
            name: "Other",
            value: entries
              .slice(maxCategories - 1)
              .reduce((sum, entry) => sum + entry.value, 0),
          },
        ]
      : entries;

  return visible.map((entry, index) => ({
    ...entry,
    color: DISTINCT_COLORS[index % DISTINCT_COLORS.length],
  }));
}

function normalizeLabel(value: string | undefined, field: ChartField): string {
  const normalized = value?.trim();
  if (!normalized || ["unknown", "n/a", "null"].includes(normalized.toLowerCase())) {
    return "Unknown";
  }
  if (field === "status") {
    return normalized
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return normalized;
}
