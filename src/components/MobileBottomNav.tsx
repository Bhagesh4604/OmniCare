import React from 'react';
import { LayoutDashboard, Calendar, Pill, Heart, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileBottomNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onMenuClick: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onTabChange, onMenuClick }) => {
    const navItems = [
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
        { id: 'appointments', label: 'Visits', icon: Calendar },
        { id: 'medications', label: 'Meds', icon: Pill },
        { id: 'heart-health', label: 'Heart', icon: Heart },
        { id: 'menu', label: 'More', icon: Menu },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t-2 border-blue-500 dark:border-blue-400 shadow-[0_-4px_30px_rgba(59,130,246,0.3)]">
            <div className="grid grid-cols-5 h-20">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => item.id === 'menu' ? onMenuClick() : onTabChange(item.id)}
                            className="relative flex flex-col items-center justify-center gap-1 transition-colors min-h-[56px]"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-bottom-nav"
                                    className="absolute inset-0 bg-blue-500/10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                />
                            )}

                            <div className="relative z-10 flex flex-col items-center gap-1">
                                <Icon
                                    size={24}
                                    className={`transition-colors ${isActive
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span
                                    className={`text-xs font-medium transition-colors ${isActive
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </div>

                            {isActive && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 dark:bg-blue-400 rounded-b-full"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
