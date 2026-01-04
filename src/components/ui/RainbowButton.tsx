import React from 'react';
import { cn } from '@/lib/utils';

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const RainbowButton = ({ className, children, ...props }: RainbowButtonProps) => {
    return (
        <button
            className={cn(
                "rainbow-border relative flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-full transition-transform active:scale-95 hover:scale-105",
                className
            )}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </button>
    );
};
