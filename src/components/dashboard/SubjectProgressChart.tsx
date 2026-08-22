'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SubjectSeriesPoint, getSeriesSubjects } from '@/lib/progress-chart';

const LINE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

export function SubjectProgressChart({
  data,
  height = 300,
}: {
  data: SubjectSeriesPoint[];
  height?: number;
}) {
  const subjects = getSeriesSubjects(data);
  const hasData = subjects.length > 0 && data.some((d) => subjects.some((s) => d[s] !== null));

  if (!hasData) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Sem dados de evolução por disciplina ainda.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
        <Tooltip />
        <Legend />
        {subjects.map((s, i) => (
          <Line
            key={s}
            type="monotone"
            dataKey={s}
            stroke={LINE_COLORS[i % LINE_COLORS.length]}
            strokeWidth={2}
            connectNulls
            dot={{ r: 2 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
