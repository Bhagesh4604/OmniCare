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

import WhatsAppSimulator from '@/components/admin/WhatsAppSimulator';

// Header component
const AppHeader = ({ moduleName, onBack, onLogout, toggleTheme, theme }) => (
  <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
    <div className="flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700">
          <ArrowLeft size={18} />
        </button>
      )}
      <h1 className="text-3xl font-bold text-white">{moduleName}</h1>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <button onClick={onLogout} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
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
    console.log("DEBUG: Current activeModule is:", activeModule); // Debug logging
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
      case 'whatsapp-simulator':
        return <WhatsAppSimulator />;
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
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden font-sans">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        userType={user.role}
        onLogout={onLogout}
      />
      <main className="flex-1 overflow-y-auto bg-black">
        <AppHeader
          moduleName={getModuleName()}
          onBack={activeModule !== 'dashboard' ? () => setActiveModule('dashboard') : null}
          onLogout={onLogout}
          toggleTheme={toggleTheme}
          theme={theme}
        />
        {renderModule()}
      </main>
    </div>
  );
}