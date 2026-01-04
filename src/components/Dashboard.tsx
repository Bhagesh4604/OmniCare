import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Stethoscope, Bed, DollarSign, TrendingUp, Scissors, Sun, Moon, Activity, Pill, Clock, LayoutGrid, Bell } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import EmergencyAlertWidget from './EmergencyAlertWidget';
import apiUrl from '@/config/api';

// --- SPATIAL COMPONENTS ---
const SpatialCard = ({ children, className = "", onClick }: any) => (
  <div onClick={onClick} className={`spatial-card p-6 ${className} ${onClick ? 'cursor-pointer' : ''}`}>
    {children}
  </div>
);

// --- 3D Stat Card Component ---
interface StatCardProps {
  title: string;
  value: string;
  icon: any;
  color: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <SpatialCard className="relative group overflow-hidden h-full">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${color.replace('text-', 'bg-')}/20 blur-2xl group-hover:scale-150 transition-transform duration-700`} />

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide uppercase mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-500 dark:group-hover:from-white dark:group-hover:to-gray-400 transition-all">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl ${color.replace('text-', 'bg-')}/10 border border-black/5 dark:border-white/5`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1 text-sm text-green-500 dark:text-green-400 font-bold">
          <TrendingUp size={16} /> {trend}
        </div>
      )}
    </SpatialCard>
  );
};

interface QuickActionProps {
  label: string;
  icon: any;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ label, icon: Icon, onClick }) => (
  <button onClick={onClick} className="flex items-center space-x-3 text-left w-full p-4 rounded-2xl transition-all bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 border border-white/20 dark:border-white/5 hover:border-blue-400/50 dark:hover:border-white/20 text-gray-900 dark:text-white group shadow-sm">
    <div className="p-2 rounded-xl bg-white/50 dark:bg-white/5 group-hover:scale-110 transition-transform">
      <Icon className="w-5 h-5 text-blue-600 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-white" />
    </div>
    <span className="font-semibold text-sm">{label}</span>
  </button>
);

interface AgendaItem {
  id: string;
  appointmentDate: string;
  notes: string;
  patientName: string;
  status: string;
}

interface DashboardProps {
  setActiveModule: (module: string) => void;
}

export default function Dashboard({ setActiveModule }: DashboardProps) {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeStaff: 0,
    availableBeds: 0,
    revenue: 0,
  });
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const { translate } = useLanguage() as any;
  const [currentDate, setCurrentDate] = useState('');
  const [waitTime, setWaitTime] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Morning');
    else if (hour < 18) setTimeOfDay('Afternoon');
    else setTimeOfDay('Evening');

    setCurrentDate(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsResponse = await fetch(apiUrl('/api/dashboard/stats'));
      const statsData = await statsResponse.json();
      if (statsData) setStats(statsData);

      const agendaResponse = await fetch(apiUrl('/api/dashboard/agenda'));
      const agendaData = await agendaResponse.json();
      if (Array.isArray(agendaData)) setAgenda(agendaData);

      const waitTimeResponse = await fetch(apiUrl('/api/analytics/predict-wait-time'));
      const waitTimeData = await waitTimeResponse.json();
      if (waitTimeData.success) setWaitTime(waitTimeData.waitTimeMinutes);

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  const [translatedTexts, setTranslatedTexts] = useState({
    totalPatients: 'Total Patients',
    activeStaff: 'Active Staff',
    availableBeds: 'Available Beds',
    estWaitTime: 'Est. Wait Time',
    todaysRevenue: 'Today\'s Revenue',
    quickActions: 'Quick Actions',
    todaysAgenda: 'Today\'s Agenda',
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening'
  });

  useEffect(() => {
    // ... translation logic remains same ...
    const updateTranslations = async () => {
      setTranslatedTexts({
        totalPatients: await translate('Total Patients'),
        activeStaff: await translate('Active Staff'),
        availableBeds: await translate('Available Beds'),
        estWaitTime: await translate('Est. Wait Time'),
        todaysRevenue: await translate('Today\'s Revenue'),
        quickActions: await translate('Quick Actions'),
        todaysAgenda: await translate('Today\'s Agenda'),
        goodMorning: await translate('Good Morning'),
        goodAfternoon: await translate('Good Afternoon'),
        goodEvening: await translate('Good Evening')
      });
    };
    updateTranslations();
  }, [translate]);

  const getGreeting = () => {
    if (timeOfDay === 'Morning') return translatedTexts.goodMorning;
    if (timeOfDay === 'Afternoon') return translatedTexts.goodAfternoon;
    return translatedTexts.goodEvening;
  };

  const statCards = [
    { title: translatedTexts.totalPatients, value: stats.totalPatients.toLocaleString(), icon: Users, color: 'text-pink-400', trend: "+12%" },
    { title: translatedTexts.activeStaff, value: stats.activeStaff.toLocaleString(), icon: Stethoscope, color: 'text-cyan-400' },
    { title: translatedTexts.availableBeds, value: stats.availableBeds.toLocaleString(), icon: Bed, color: 'text-emerald-400' },
    { title: translatedTexts.estWaitTime, value: `${waitTime}m`, icon: Clock, color: 'text-orange-400', trend: "AI Optimized" },
    { title: translatedTexts.todaysRevenue, value: `$${Number(stats.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-violet-400', trend: "+8.4%" },
  ];

  // --- IoT Simulation State ---
  const [heartRate, setHeartRate] = useState(72);
  const [oxygenLevel, setOxygenLevel] = useState(98);
  const [ecgData, setEcgData] = useState(new Array(20).fill(50));

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        const newVal = prev + change;
        return newVal > 100 ? 100 : newVal < 60 ? 60 : newVal;
      });
      setOxygenLevel(prev => {
        const change = Math.floor(Math.random() * 3) - 1;
        const newVal = prev + change;
        return newVal > 100 ? 100 : newVal < 95 ? 95 : newVal;
      });
      setEcgData(prev => {
        const newData = [...prev.slice(1), Math.random() * 40 + 30];
        return newData;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-full space-y-8">
      {/* Background Orbs removed here, managed by MainApplication spatial-bg */}

      <EmergencyAlertWidget />

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <div className="text-sm font-semibold text-blue-500 dark:text-blue-400 mb-1 tracking-wide uppercase">{currentDate}</div>
          <h1 className="text-4xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
            {getGreeting()}
            {timeOfDay === 'Morning' ? <Sun className="text-yellow-500" /> : timeOfDay === 'Afternoon' ? <Sun className="text-orange-500" /> : <Moon className="text-blue-500" />}
          </h1>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <LanguageSwitcher />
          <button className="p-3 bg-white/50 dark:bg-white/10 rounded-full border border-gray-200 dark:border-white/10 relative shadow-sm">
            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
          </button>
        </div>
      </div>

      {/* --- STAT UPDATES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- IoT LIVE VITALS --- */}
        <div className="lg:col-span-2">
          <SpatialCard className="relative overflow-hidden group !p-0 h-full">
            <div className="p-8 relative z-10 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 h-full">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Activity size={200} className="text-gray-900 dark:text-white" />
              </div>

              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Live ICU Monitoring
                </h2>
                <div className="text-xs px-3 py-1 rounded-full bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-blue-600 dark:text-blue-200 font-mono tracking-wider">
                  ICU-WARD-01
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Heart Rate */}
                <div className="bg-white/40 dark:bg-black/20 p-6 rounded-2xl border border-white/20 dark:border-white/5 backdrop-blur-sm shadow-sm">
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Heart Rate</p>
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-5xl font-black text-gray-900 dark:text-white">{heartRate}</span>
                    <span className="text-sm text-red-500 dark:text-red-400 font-bold mb-2">BPM</span>
                  </div>
                  <div className="w-full h-12 flex items-end justify-between gap-1 opacity-80">
                    {ecgData.map((val, i) => (
                      <div key={i} className="w-full bg-gradient-to-t from-red-500 to-transparent rounded-t-sm"
                        style={{ height: `${val}%`, opacity: (i / ecgData.length) + 0.2 }}></div>
                    ))}
                  </div>
                </div>

                {/* Oxygen */}
                <div className="bg-white/40 dark:bg-black/20 p-6 rounded-2xl border border-white/20 dark:border-white/5 backdrop-blur-sm shadow-sm">
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Oxygen (SpO2)</p>
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-5xl font-black text-gray-900 dark:text-white">{oxygenLevel}</span>
                    <span className="text-sm text-blue-500 dark:text-blue-400 font-bold mb-2">%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${oxygenLevel}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="bg-white/40 dark:bg-black/20 p-6 rounded-2xl border border-white/20 dark:border-white/5 backdrop-blur-sm flex flex-col items-center justify-center shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(34,197,94,0.1)] animate-pulse">
                    <Activity className="text-green-500 w-8 h-8" />
                  </div>
                  <span className="text-green-600 dark:text-green-400 font-bold tracking-wider text-sm">STABLE</span>
                  <span className="text-xs text-gray-500 mt-1 font-mono">Uptime: 99.9%</span>
                </div>
              </div>
            </div>
          </SpatialCard>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <SpatialCard className="border-t-4 border-t-blue-500">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2"><LayoutGrid size={18} /> {translatedTexts.quickActions}</h3>
            <div className="space-y-3">
              <QuickAction label="Admit New Patient" icon={Users} onClick={() => setActiveModule('patients')} />
              <QuickAction label="Schedule Surgery" icon={Scissors} onClick={() => setActiveModule('surgical')} />
              <QuickAction label="New Lab Test" icon={Activity} onClick={() => setActiveModule('laboratory')} />
              <QuickAction label="AI Screening" icon={Stethoscope} onClick={() => setActiveModule('early-detection')} />
            </div>
          </SpatialCard>

          {/* Today's Agenda */}
          <SpatialCard className="border-t-4 border-t-purple-500">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2"><Clock size={18} /> Today's Agenda</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {agenda.length > 0 ? agenda.map(item => (
                <div key={item.id} className="flex items-center space-x-4 p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                  <div className="w-1 h-12 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                  <div className="w-20 text-sm font-bold text-gray-600 dark:text-gray-300">{new Date(item.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{item.notes || 'Check-up'}</p>
                    <p className="text-xs text-gray-500 truncate">{item.patientName}</p>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Clock size={40} className="mb-3 opacity-20" />
                  <p>No appointments today.</p>
                </div>
              )}
            </div>
          </SpatialCard>
        </div>
      </div>
    </div>
  );
}