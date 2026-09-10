import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function MobileLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-red-100 dark:selection:bg-red-900/30 flex justify-center transition-colors duration-200">
      <div className={cn("w-full max-w-md bg-[#f9fafb] dark:bg-gray-950 min-h-screen relative flex flex-col shadow-sm transition-colors duration-200", className)}>
        {children}
      </div>
    </div>
  );
}
