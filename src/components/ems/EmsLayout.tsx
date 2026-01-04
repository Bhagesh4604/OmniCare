import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import { Sun, Moon, LogOut } from 'lucide-react';

const EmsLayout = ({ children, user, onLogout }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Omni Care - EMS</h1>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <div className="flex items-center space-x-2">
            <img
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`}
              className="h-8 w-8 flex-shrink-0 rounded-full"
              alt="Avatar"
            />
            <span className="text-gray-900 dark:text-white font-medium">{user.firstName}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout} className="text-red-500 hover:text-red-600">
            <LogOut size={20} />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </header>
      <main className="relative flex-1 overflow-y-auto bg-background">
        <div className="relative z-10 bg-transparent">
          {children}
        </div>
      </main>
    </div>
  );
};

export default EmsLayout;
