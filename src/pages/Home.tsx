import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoals } from '../hooks/useDomain';
import { MobileLayout } from '../components/MobileLayout';
import { Plus, ChevronRight } from 'lucide-react';
import { UserMenu } from '../components/UserMenu';
import { domainService } from '../services/domainService';
import { getDiffDaysLocal, getTodayLocal } from '../utils/dates';
import { ThemeToggle } from '../components/ThemeToggle';

const QUOTES = [
  { text: "A vida não examinada não vale a pena ser vivida.", author: "Sócrates" },
  { text: "O que pode ser medido pode ser melhorado.", author: "Peter Drucker" },
  { text: "Não espere por circunstâncias ideais. Elas nunca chegam.", author: "Janet Erskine Stuart" },
  { text: "A disciplina é a ponte entre metas e realizações.", author: "Jim Rohn" },
  { text: "Você é o que você faz repetidamente. A excelência não é um ato, mas um hábito.", author: "Aristóteles" },
  { text: "Ação é a chave fundamental para todo sucesso.", author: "Pablo Picasso" },
  { text: "Sorte é o que acontece quando a preparação encontra a oportunidade.", author: "Sêneca" },
  { text: "A jornada de mil milhas começa com um único passo.", author: "Lao-Tsé" }
];

export default function Home() {
  const { goals, loading, reload } = useGoals();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    // Pick a random quote
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    
    // Run migration if needed
    domainService.migrateLocalData().then(() => {
      reload();
    });
  }, [reload]);

  if (loading) {
    return (
      <MobileLayout className="p-6">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
           <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin mb-4" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout className="p-6">
      <header className="flex justify-between items-center pt-6 pb-2">
        <h1 className="text-3xl font-bold tracking-tight">Objetivos</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      <div className="mb-8 mt-2">
        <blockquote className="text-gray-600 italic">
          "{quote.text}"
        </blockquote>
        <p className="text-gray-400 text-sm mt-2 font-medium">— {quote.author}</p>
      </div>

      <main className="flex-1 flex flex-col gap-4">
        {goals.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
            <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">O que você quer alcançar?</h2>
            <p className="text-sm text-gray-500 mb-8">Defina seu primeiro objetivo e comece a agir.</p>
            <Link
              to="/create"
              className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-2xl font-medium active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5" />
              <span>Criar objetivo</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase">Seus objetivos</h2>
            </div>
            
            <div className="flex flex-col gap-3">
              {goals.map((goal: any) => {
                const totalDays = getDiffDaysLocal(goal.startDate, goal.endDate) + 1;
                const markCount = goal.markCount || 0;
                const progressPercent = totalDays > 0 ? Math.round((markCount / totalDays) * 100) : 0;
                const daysLeft = Math.max(0, totalDays - markCount);
                
                return (
                  <Link 
                    to={`/objective/${goal.id}`} 
                    key={goal.id} 
                    className="bg-white dark:bg-gray-900 dark:border-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center active:scale-[0.98] transition-transform"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">{goal.title}</h3>
                      <p className="text-gray-500 text-sm font-medium">
                        {progressPercent}% concluído • Faltam {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
                      </p>
                    </div>
                    <ChevronRight className="text-gray-300 w-5 h-5" />
                  </Link>
                );
              })}
            </div>
            
            <Link
              to="/create"
              className="flex items-center justify-center gap-2 bg-gray-50 text-gray-900 dark:text-gray-100 border border-gray-200 px-5 py-4 rounded-2xl font-medium active:bg-gray-100 transition-colors mt-4"
            >
              <Plus className="w-5 h-5" />
              <span>Novo objetivo</span>
            </Link>
          </>
        )}
      </main>
    </MobileLayout>
  );
}
