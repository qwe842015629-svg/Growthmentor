import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart
} from 'recharts';
import { ChartData } from '../types';

interface ChartRendererProps {
  data: ChartData;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ data }) => {
  const renderChart = () => {
    const commonProps = {
      data: data.data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    switch (data.type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={data.xKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            />
            <Legend />
            {data.dataKeys.map((k) => (
              <Line 
                key={k.key} 
                type="monotone" 
                dataKey={k.key} 
                stroke={k.color} 
                name={k.name || k.key} 
                strokeWidth={2}
              />
            ))}
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={data.xKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            />
            <Legend />
            {data.dataKeys.map((k) => (
              <Area 
                key={k.key} 
                type="monotone" 
                dataKey={k.key} 
                stroke={k.color} 
                fill={k.color} 
                name={k.name || k.key} 
              />
            ))}
          </AreaChart>
        );
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={data.xKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
               contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            />
            <Legend />
            {data.dataKeys.map((k, index) => {
               // Alternate simple logic for demo: first bar, rest line
               if (index === 0) return <Bar key={k.key} dataKey={k.key} fill={k.color} name={k.name} />;
               return <Line key={k.key} type="monotone" dataKey={k.key} stroke={k.color} name={k.name} />;
            })}
          </ComposedChart>
        );
      case 'bar':
      default:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={data.xKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
              cursor={{fill: '#334155', opacity: 0.4}}
            />
            <Legend />
            {data.dataKeys.map((k) => (
              <Bar 
                key={k.key} 
                dataKey={k.key} 
                fill={k.color} 
                name={k.name || k.key} 
              />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full h-[300px] bg-slate-900 rounded-lg p-4 my-4 border border-slate-800">
      <h4 className="text-sm font-semibold text-slate-400 mb-2 text-center uppercase tracking-wider">{data.title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartRenderer;
