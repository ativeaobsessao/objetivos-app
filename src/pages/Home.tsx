import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoals } from '../hooks/useDomain';
import { MobileLayout } from '../components/MobileLayout';
import { Plus } from 'lucide-react';
import { UserMenu } from '../components/UserMenu';
import { domainService } from '../services/domainService';

export default function Home() {
  const { goals, loading, reload } = useGoals();
  const navigate = useNavigate();

  useEffect(() => {
    // Run migration if needed
    domainService.migrateLocalData().then(() => {
      reload();
    });
  }, []);

  useEffect(() => {
    if (!loading && goals.length > 0) {
      // Find first active, or just first if none active
      const active = goals.find(g => g.status === 'active') || goals[0];
      navigate(`/objective/${active.id}`, { replace: true });
    }
  }, [goals, loading, navigate]);

  if (loading) {
    return (
      <MobileLayout className="p-6">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
           <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin mb-4" />
        </div>
      </MobileLayout>
    );
  }

  // Only reaches here if NO goals exist (due to the useEffect redirect)
  return (
    <MobileLayout className="p-6">
      <header className="flex justify-between items-center py-6 mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Objetivos</h1>
        <UserMenu />
      </header>

      <main className="flex-1 flex flex-col gap-4">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-xl font-medium text-gray-900 mb-2">O que você quer alcançar?</h2>
          <p className="text-sm text-gray-500 mb-8">Defina seu primeiro objetivo e comece a agir.</p>
          <Link
            to="/create"
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-2xl font-medium active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" />
            <span>Criar objetivo</span>
          </Link>
        </div>
      </main>
    </MobileLayout>
  );
}
