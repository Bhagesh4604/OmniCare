import React, { useState } from 'react';
import { ArrowLeft, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Import all modules using the new path alias
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import PatientManagement from '@/components/PatientManagement';
import EmployeeManagement from '@/components/EmployeeManagement';
import PharmacyManagement from '@/components/PharmacyManagement';
import AccountingModule from '@/components/AccountingModule';
import LaboratoryModule from '@/components/LaboratoryModule';
import MedicalRecordsModule from '@/components/MedicalRecordsModule';
import SurgicalModule from '@/components/SurgicalModule';
import PayrollModule from '@/components/PayrollModule';
import VendorModule from '@/components/VendorModule';
import InventoryModule from '@/components/InventoryModule';
import SMSModule from '@/components/SMSModule';
import AppointmentsView from '@/components/AppointmentsView';
import EarlyDetectionModule from '@/components/EarlyDetectionModule';



// Header component (Glassmorphic)
const AppHeader = ({ moduleName, onBack, onLogout, toggleTheme, theme }) => (
  <div className="flex justify-between items-center p-4 sticky top-0 z-50 bg-white/70 dark:bg-black/40 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 spatial-shadow">
    <div className="flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
      )}
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-white dark:to-gray-300">{moduleName}</h1>
    </div>
    <div className="flex items-center gap-3">
      <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-gray-700 dark:text-white transition-all shadow-sm border border-gray-200 dark:border-white/5">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <button onClick={onLogout} className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all border border-red-500/20">
        <LogOut size={18} />
      </button>
    </div>
  </div>
);

// Main application layout after a staff member logs in
export default function MainApplication({ user, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const [activeModule, setActiveModule] = useState('dashboard');

  // Renders the correct module based on the active state and user role
  const renderModule = () => {
    // ... (logic remains same) ...
    const isAdmin = user.role === 'admin';
    const isDoctor = user.role === 'doctor';

    switch (activeModule) {
      case 'dashboard':
        return <Dashboard setActiveModule={setActiveModule} />;
      case 'patients':
        return <PatientManagement />;
      case 'pharmacy':
        return <PharmacyManagement />;
      case 'laboratory':
        return <LaboratoryModule />;
      case 'medical-records':
        return <MedicalRecordsModule />;
      case 'surgical':
        return <SurgicalModule />;
      case 'appointments':
        return <AppointmentsView user={user} />;
      case 'employees':
        return isAdmin ? <EmployeeManagement /> : <div className="p-8 text-red-500">Access Denied</div>;
      case 'accounting':
        return isAdmin ? <AccountingModule /> : <div className="p-8 text-red-500">Access Denied</div>;
      case 'payroll':
        return isAdmin ? <PayrollModule /> : <div className="p-8 text-red-500">Access Denied</div>;
      case 'vendors':
        return isAdmin ? <VendorModule /> : <div className="p-8 text-red-500">Access Denied</div>;
      case 'inventory':
        return isAdmin ? <InventoryModule /> : <div className="p-8 text-red-500">Access Denied</div>;
      case 'sms':
        return isAdmin ? <SMSModule /> : <div className="p-8 text-red-500">Access Denied</div>;
      case 'early-detection':
        return <EarlyDetectionModule />;

      default:
        return <Dashboard setActiveModule={setActiveModule} />;
    }
  };

  const getModuleName = () => {
    if (!activeModule) return 'Dashboard';
    return activeModule
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans spatial-bg text-gray-900 dark:text-white">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        userType={user.role}
        onLogout={onLogout}
      />
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Only show header if NOT dashboard, as Dashboard has its own header */}
        {activeModule !== 'dashboard' && (
          <AppHeader
            moduleName={getModuleName()}
            onBack={activeModule !== 'dashboard' ? () => setActiveModule('dashboard') : null}
            onLogout={onLogout}
            toggleTheme={toggleTheme}
            theme={theme}
          />
        )}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}