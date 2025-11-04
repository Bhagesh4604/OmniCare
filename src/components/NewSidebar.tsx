// src/components/Sidebar.tsx (Corrected)

import React from 'react';
import {
  LayoutDashboard, Users, UserCog, Pill, DollarSign, Activity,
  FileText, Stethoscope, Scissors, CreditCard, Package, MessageSquare,
  LogOut, Calendar, Sun, Moon, Clock, BarChartHorizontal, BedDouble, Syringe, Video
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

const SidebarItem = ({ item, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 relative ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 dark:hover:text-white'}`}
        >
            {isActive && (
                <div
                    className="absolute inset-0 bg-blue-600 rounded-lg"
                    style={{ borderRadius: 8 }}
                />
            )}
            <span className="relative z-10"><item.icon size={20} /></span>
            <span className="relative z-10 font-semibold">{item.label}</span>
        </button>
    );
};

export default function NewSidebar({ activeModule, setActiveModule, userType, onLogout, isSidebarOpen, setSidebarOpen, user }) {
  console.log('userType:', userType);
  const { theme, toggleTheme } = useTheme();
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChartHorizontal },
    { id: 'bed-management', label: 'Bed Management', icon: BedDouble },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'employees', label: 'Employees', icon: UserCog },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
    { id: 'accounting', label: 'Accounting', icon: DollarSign },
    { id: 'billing', label: 'Billing', icon: CreditCard }, // New item
    { id: 'laboratory', label: 'Laboratory', icon: Activity },
    { id: 'medical-records', label: 'Medical Records', icon: FileText },
    { id: 'immunizations', label: 'Immunizations', icon: Syringe }, // New item
    { id: 'surgical', label: 'Surgical', icon: Scissors },
    { id: 'payroll', label: 'Payroll', icon: CreditCard },
    { id: 'vendors', label: 'Vendors', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'sms', label: 'SMS & Reports', icon: MessageSquare },
  ];

  const doctorMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-schedule', label: 'My Schedule', icon: Clock },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'telemedicine', label: 'Telemedicine', icon: Video }, // New item
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
    { id: 'laboratory', label: 'Laboratory', icon: Activity },
    { id: 'medical-records', label: 'Medical Records', icon: FileText },
    { id: 'surgical', label: 'Surgical', icon: Scissors },
  ];

  const patientMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'lab_results', label: 'Lab Results', icon: Activity },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'medications', label: 'Medication Tracker', icon: Clock },
    { id: 'timeline', label: 'Health Timeline', icon: BarChartHorizontal },
  ];

  const menuItems = userType === 'admin' ? adminMenuItems : userType === 'doctor' ? doctorMenuItems : patientMenuItems;

  const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  
  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-gray-800 flex flex-col font-sans transition-transform duration-300 ease-in-out z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative lg:w-64`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <img src="/logo.svg" alt="Shree Medicare Logo" className="w-10 h-10 rounded-lg object-cover" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Shree Medicare
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-500">HMS</p>
            </div>
          </div>
        </div>

        <nav 
          className="flex-1 p-4 space-y-1 overflow-y-auto"
        >
          {menuItems.map((item) => (
            <div key={item.id}>
              <SidebarItem
                item={item}
                isActive={activeModule === item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  setSidebarOpen(false);
                }}
              />
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-100 dark:bg-gray-800/50">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Theme</span>
              <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"> 
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
          </div>
          <SidebarItem
            item={{
              id: 'profile',
              label: `${user.firstName} ${user.lastName}`,
              icon: ()=><img
                  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`}
                  className="h-7 w-7 flex-shrink-0 rounded-full"
                  alt="Avatar"
                />,
            }}
            isActive={activeModule === 'profile'}
            onClick={() => setActiveModule('profile')}
          />
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-500 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}