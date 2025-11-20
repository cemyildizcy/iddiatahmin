import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface Props {
  data: { score: string; prob: number }[];
}

export const DistributionChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-64 w-full bg-slate-900/50 rounded-xl p-4 border border-slate-800">
      <h3 className="text-sm font-mono text-slate-400 mb-4 uppercase tracking-wider">
        Skor Olasılık Matrisi (İlk 10)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="score" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            unit="%"
          />
          <Tooltip 
            cursor={{ fill: '#1e293b', opacity: 0.5 }}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
          />
          <Bar dataKey="prob" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#0ea5e9' : '#334155'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};