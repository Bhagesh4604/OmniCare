
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  StackedAreaChart,
  LinearXAxis,
  LinearXAxisTickSeries,
  LinearXAxisTickLabel,
  LinearYAxis,
  LinearYAxisTickSeries,
  StackedAreaSeries,
  Line,
  Area,
  Gradient,
  GradientStop,
  GridlineSeries,
  Gridline,
  ChartDataTypes,
} from 'reaviz';
import apiUrl from '@/config/api';

// SVG Icon Components
const BedIcon: React.FC<{ className?: string; fill?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 9.557V3h-2v4.557a2.5 2.5 0 1 0 2 2zM8 9H2V3h2v4h4V3h2v6zm-6 8v-6h8v6H2zm18 0v-6h-8v6h8z"/></svg>
);

const ClockIcon: React.FC<{ className?: string; fill?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm1 3v5h4v2h-6V7h2z"/></svg>
);

const PatientIcon: React.FC<{ className?: string; fill?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3zm-7 12a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-1z"/></svg>
);

const DetailedTrendUpIcon: React.FC<{ baseColor: string; strokeColor: string; className?: string }> = ({ baseColor, strokeColor, className }) => (
  <svg className={className} width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="14" fill={baseColor} fillOpacity="0.4" />
    <path d="M9.50134 12.6111L14.0013 8.16663M14.0013 8.16663L18.5013 12.6111M14.0013 8.16663L14.0013 19.8333" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
  </svg>
);

const DetailedTrendDownIcon: React.FC<{ baseColor: string; strokeColor: string; className?: string }> = ({ baseColor, strokeColor, className }) => (
  <svg className={className} width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="14" fill={baseColor} fillOpacity="0.4" />
    <path d="M18.4987 15.3889L13.9987 19.8334M13.9987 19.8334L9.49866 15.3889M13.9987 19.8334V8.16671" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
  </svg>
);

const SummaryUpArrowIcon: React.FC<{ strokeColor: string }> = ({ strokeColor }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
    <path d="M5.50134 9.11119L10.0013 4.66675M10.0013 4.66675L14.5013 9.11119M10.0013 4.66675L10.0013 16.3334" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
  </svg>
);

const SummaryDownArrowIcon: React.FC<{ strokeColor: string }> = ({ strokeColor }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
    <path d="M14.4987 11.8888L9.99866 16.3333M9.99866 16.3333L5.49866 11.8888M9.99866 16.3333V4.66658" stroke={strokeColor} strokeWidth="2" strokeLinecap="square" />
  </svg>
);

const AnalyticsDashboard: React.FC = () => {
  const [chartData, setChartData] = useState<ChartDataTypes[]>([]);
  const [stats, setStats] = useState<any>({});

  const padData = (data: any[], days: number) => {
    const paddedData: any[] = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const formattedDate = date.toISOString().slice(0, 10);
      const existingData = data.find(d => d.date.slice(0, 10) === formattedDate);
      paddedData.push({
        key: date,
        data: existingData ? existingData.count : 0,
      });
    }
    return paddedData.reverse();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl('/api/analytics/summary'));
        const data = await response.json();
        console.log("Analytics data from backend:", JSON.stringify(data));

        // Process chart data
        const admissionsData = Array.isArray(data.admissionsLast7Days) ? data.admissionsLast7Days : [];
        const appointmentsData = Array.isArray(data.appointmentsLast7Days) ? data.appointmentsLast7Days : [];

        const admissions = padData(admissionsData, 7).map(d => ({ key: new Date(d.key), data: d.data }));
        const appointments = padData(appointmentsData, 7).map(d => ({ key: new Date(d.key), data: d.data }));
        
        setChartData([
          { key: 'Admissions', data: admissions },
          { key: 'Appointments', data: appointments },
        ]);

        // Process stats
        setStats({
            newPatients: (data.newPatientsToday && data.newPatientsToday[0]?.count) || 0,
            todaysAppointments: (data.appointmentsToday && data.appointmentsToday[0]?.count) || 0,
            bedOccupancy: (data.bedOccupancy && data.bedOccupancy[0] && data.bedOccupancy[0].total > 0) ? (data.bedOccupancy[0].occupied / data.bedOccupancy[0].total) * 100 : 0,
            avgWaitTime: 25, // Mock data
            totalRevenue: (data.totalRevenue && data.totalRevenue[0]?.total) || 0,
            revenueToday: (data.revenueToday && data.revenueToday[0]?.total) || 0,
        });

      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      }
    };

    fetchData();
  }, []);

  const LEGEND_ITEMS = [
    { name: 'Admissions', color: '#8884d8' },
    { name: 'Appointments', color: '#82ca9d' },
  ];

  const CHART_COLOR_SCHEME = ['#8884d8', '#82ca9d'];

  return (
    <>
      <style>{`
        :root {
          --reaviz-tick-fill: #666;
          --reaviz-gridline-stroke: #e0e0e0;
        }
        .dark {
          --reaviz-tick-fill: #A0AEC0;
          --reaviz-gridline-stroke: rgba(74, 85, 104, 0.6);
        }
      `}</style>
      <div className="flex flex-col justify-between p-4 sm:p-6 bg-background text-foreground rounded-3xl shadow-lg w-full max-w-4xl mx-auto my-8 min-h-[714px] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-3">
          <h3 className="text-2xl sm:text-3xl text-left font-bold">
            Hospital Analytics
          </h3>
        </div>

        {/* Legend */}
        <div className="flex gap-8 w-full pl-4 mb-4">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.name} className="flex gap-2 items-center">
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground text-xs">{item.name}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="reaviz-chart-container h-[280px] px-2">
          <StackedAreaChart
            height={280}
            data={chartData}
            xAxis={
              <LinearXAxis
                type="time"
                tickSeries={
                  <LinearXAxisTickSeries
                    label={
                      <LinearXAxisTickLabel
                        format={v => new Date(v).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                        fill="var(--reaviz-tick-fill)"
                      />
                    }
                  />
                }
              />
            }
            yAxis={
              <LinearYAxis
                axisLine={null}
                tickSeries={<LinearYAxisTickSeries line={null} label={null} />}
              />
            }
            series={
              <StackedAreaSeries
                line={<Line strokeWidth={2} />}
                area={
                  <Area
                    gradient={
                      <Gradient
                        stops={[
                          <GradientStop key={1} offset="0%" stopOpacity={0.3} />,
                          <GradientStop key={2} offset="100%" stopOpacity={0} />,
                        ]}
                      />
                    }
                  />
                }
                colorScheme={CHART_COLOR_SCHEME}
              />
            }
            gridlines={<GridlineSeries line={<Gridline stroke="var(--reaviz-gridline-stroke)" />} />}
          />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 w-full p-4 justify-between pt-8 gap-6">
            <div className="flex flex-col gap-2 w-full">
              <span className="text-xl text-muted-foreground">New Patients Today</span>
              <CountUp
                  className="font-mono text-4xl font-semibold text-foreground"
                  end={stats.newPatients || 0}
                  duration={2}
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <span className="text-xl text-muted-foreground">Appointments Today</span>
              <CountUp
                  className="font-mono text-4xl font-semibold text-foreground"
                  end={stats.todaysAppointments || 0}
                  duration={2}
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <span className="text-xl text-muted-foreground">Revenue Today</span>
              <CountUp
                  className="font-mono text-4xl font-semibold text-foreground"
                  prefix="$"
                  end={stats.revenueToday || 0}
                  duration={2}
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <span className="text-xl text-muted-foreground">Total Revenue</span>
              <CountUp
                  className="font-mono text-4xl font-semibold text-foreground"
                  prefix="$"
                  end={stats.totalRevenue || 0}
                  duration={2}
              />
            </div>
        </div>

        {/* Detailed Metrics List */}
        <div className="flex flex-col p-4 font-mono divide-y divide-border mt-4">
            <motion.div className="flex w-full py-4 items-center gap-2">
              <div className="flex flex-row gap-2 items-center text-base w-1/2 text-muted-foreground">
                <BedIcon className="w-6 h-6 text-blue-400" />
                <span className="truncate" title="Bed Occupancy Rate">Bed Occupancy Rate</span>
              </div>
              <div className="flex gap-2 w-1/2 justify-end items-center">
                <span className="font-semibold text-xl text-foreground">{stats.bedOccupancy?.toFixed(1) || 0}%</span>
              </div>
            </motion.div>
            <motion.div className="flex w-full py-4 items-center gap-2">
              <div className="flex flex-row gap-2 items-center text-base w-1/2 text-muted-foreground">
                <ClockIcon className="w-6 h-6 text-green-400" />
                <span className="truncate" title="Average Patient Wait Time">Avg. Wait Time (mock)</span>
              </div>
              <div className="flex gap-2 w-1/2 justify-end items-center">
                <span className="font-semibold text-xl text-foreground">{stats.avgWaitTime || 0} min</span>
              </div>
            </motion.div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsDashboard;
