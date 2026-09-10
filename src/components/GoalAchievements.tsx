import React from 'react';
import { GoalMark } from '../types';
import { parseLocal } from '../utils/dates';
import { Flame, Zap, Star, Trophy } from 'lucide-react';

export function GoalAchievements({ marks }: { marks: GoalMark[] }) {
  const dates = [...new Set(marks.map(m => m.date))].sort();
  
  let currentStreak = 0;
  let maxStreak = 0;

  if (dates.length > 0) {
    currentStreak = 1;
    maxStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prevDate = parseLocal(dates[i - 1]);
      const currDate = parseLocal(dates[i]);
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }
  }

  const totalDays = dates.length;

  const achievements = [
    {
      id: 'streak-3',
      title: 'Iniciante',
      description: '3 dias seguidos',
      icon: Flame,
      unlocked: maxStreak >= 3,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    },
    {
      id: 'streak-7',
      title: 'Consistente',
      description: '7 dias seguidos',
      icon: Zap,
      unlocked: maxStreak >= 7,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
    },
    {
      id: 'streak-21',
      title: 'Hábito Formado',
      description: '21 dias seguidos',
      icon: Star,
      unlocked: maxStreak >= 21,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      id: 'total-30',
      title: 'Mês Fechado',
      description: '30 dias totais',
      icon: Trophy,
      unlocked: totalDays >= 30,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
    }
  ];

  return (
    <section className="mb-10">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Conquistas</h2>
      </div>
      
      <div className="bg-white dark:bg-gray-900 dark:border-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {achievements.map((ach) => {
            const Icon = ach.icon;
            return (
              <div 
                key={ach.id} 
                className={`flex flex-col items-center p-4 rounded-2xl border text-center transition-all ${
                  ach.unlocked 
                    ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm' 
                    : 'border-dashed border-gray-200 dark:border-gray-800 opacity-50 grayscale'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${ach.unlocked ? ach.bgColor : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <Icon className={`w-6 h-6 ${ach.unlocked ? ach.color : 'text-gray-400'}`} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">{ach.title}</h3>
                <p className="text-xs text-gray-500 font-medium">{ach.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
