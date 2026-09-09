import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function MobileLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 font-sans selection:bg-red-100 flex justify-center">
      <div className={cn("w-full max-w-md bg-[#f9fafb] min-h-screen relative flex flex-col shadow-sm", className)}>
        {children}
      </div>
    </div>
  );
}
