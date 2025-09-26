import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Color palette for charts
const COLORS = {
  primary: '#004d4d',
  gold: '#ffd700',
  coral: '#ff6f61',
  teal: '#00b3b3',
  green: '#10b981',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899'
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.gold,
  COLORS.coral,
  COLORS.teal,
  COLORS.green,
  COLORS.blue
];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${formatter ? formatter(entry.value) : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Line Chart Component
export const CustomLineChart = ({ 
  data, 
  xDataKey = 'name', 
  lines = [{ dataKey: 'value', name: 'Value', color: COLORS.primary }],
  height = 300,
  showGrid = true,
  showLegend = true,
  formatter
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data}>
      {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
      <XAxis 
        dataKey={xDataKey} 
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 12, fill: '#64748b' }}
      />
      <YAxis 
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 12, fill: '#64748b' }}
      />
      <Tooltip content={<CustomTooltip formatter={formatter} />} />
      {showLegend && <Legend />}
      {lines.map((line, index) => (
        <Line
          key={line.dataKey}
          type="monotone"
          dataKey={line.dataKey}
          name={line.name}
          stroke={line.color || CHART_COLORS[index % CHART_COLORS.length]}
          strokeWidth={3}
          dot={{ fill: line.color || CHART_COLORS[index % CHART_COLORS.length], strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />
      ))}
    </LineChart>
  </ResponsiveContainer>
);

// Bar Chart Component
export const CustomBarChart = ({ 
  data, 
  xDataKey = 'name',
  bars = [{ dataKey: 'value', name: 'Value', color: COLORS.primary }],
  height = 300,
  showGrid = true,
  showLegend = true,
  formatter
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data}>
      {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
      <XAxis 
        dataKey={xDataKey}
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 12, fill: '#64748b' }}
      />
      <YAxis 
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 12, fill: '#64748b' }}
      />
      <Tooltip content={<CustomTooltip formatter={formatter} />} />
      {showLegend && <Legend />}
      {bars.map((bar, index) => (
        <Bar
          key={bar.dataKey}
          dataKey={bar.dataKey}
          name={bar.name}
          fill={bar.color || CHART_COLORS[index % CHART_COLORS.length]}
          radius={[4, 4, 0, 0]}
        />
      ))}
    </BarChart>
  </ResponsiveContainer>
);

// Area Chart Component
export const CustomAreaChart = ({ 
  data, 
  xDataKey = 'name',
  areas = [{ dataKey: 'value', name: 'Value', color: COLORS.primary }],
  height = 300,
  showGrid = true,
  showLegend = true,
  formatter
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data}>
      <defs>
        {areas.map((area, index) => (
          <linearGradient 
            key={`gradient-${index}`}
            id={`gradient-${index}`} 
            x1="0" 
            y1="0" 
            x2="0" 
            y2="1"
          >
            <stop 
              offset="5%" 
              stopColor={area.color || CHART_COLORS[index % CHART_COLORS.length]} 
              stopOpacity={0.3}
            />
            <stop 
              offset="95%" 
              stopColor={area.color || CHART_COLORS[index % CHART_COLORS.length]} 
              stopOpacity={0}
            />
          </linearGradient>
        ))}
      </defs>
      {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
      <XAxis 
        dataKey={xDataKey}
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 12, fill: '#64748b' }}
      />
      <YAxis 
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 12, fill: '#64748b' }}
      />
      <Tooltip content={<CustomTooltip formatter={formatter} />} />
      {showLegend && <Legend />}
      {areas.map((area, index) => (
        <Area
          key={area.dataKey}
          type="monotone"
          dataKey={area.dataKey}
          name={area.name}
          stroke={area.color || CHART_COLORS[index % CHART_COLORS.length]}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#gradient-${index})`}
        />
      ))}
    </AreaChart>
  </ResponsiveContainer>
);

// Pie Chart Component
export const CustomPieChart = ({ 
  data, 
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  showLegend = true,
  colors = CHART_COLORS,
  formatter
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        outerRadius={80}
        fill="#8884d8"
        dataKey={dataKey}
      >
        {data.map((entry, index) => (
          <Cell 
            key={`cell-${index}`} 
            fill={colors[index % colors.length]} 
          />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip formatter={formatter} />} />
      {showLegend && <Legend />}
    </PieChart>
  </ResponsiveContainer>
);

// Chart Container Component
const Chart = ({ title, children, className = "", headerActions }) => (
  <div className={`bg-white rounded-xl shadow-soft p-4 ${className}`}>
    {title && (
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {headerActions && (
          <div className="flex items-center space-x-2">
            {headerActions}
          </div>
        )}
      </div>
    )}
    {children}
  </div>
);

export default Chart;