import { Link } from 'react-router-dom';
import { useObjectives } from '../hooks/useObjectives';
import { MobileLayout } from '../components/MobileLayout';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { Plus } from 'lucide-react';
import { formatLocal, parseLocal } from '../utils/dates';

export default function Home() {
  const { objectives } = useObjectives();

  return (
    <MobileLayout className="p-6">
      <header className="flex justify-between items-center py-6 mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Objetivos</h1>
        <PWAInstallButton />
      </header>

      <main className="flex-1 flex flex-col gap-4">
        {objectives.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-xl font-medium text-gray-900 mb-2">Acompanhe o que importa.</h2>
            <p className="text-sm text-gray-500 mb-8">Nenhum objetivo ativo no momento.</p>
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
            {objectives.map((obj) => (
              <Link
                key={obj.id}
                to={`/objective/${obj.id}`}
                className="block p-5 bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] active:scale-[0.98] transition-transform"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg leading-tight">{obj.title}</h3>
                  {obj.status === 'completed' && (
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Encerrado</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {formatLocal(parseLocal(obj.startDate)).split('-').reverse().join('/')} &mdash;{' '}
                  {formatLocal(parseLocal(obj.endDate)).split('-').reverse().join('/')}
                </div>
              </Link>
            ))}
            
            <div className="mt-8">
              <Link
                to="/create"
                className="flex items-center justify-center gap-2 text-gray-900 bg-gray-100/80 px-5 py-3 rounded-2xl font-medium active:scale-95 transition-transform"
              >
                <Plus className="w-5 h-5" />
                <span>Novo objetivo</span>
              </Link>
            </div>
          </>
        )}
      </main>
    </MobileLayout>
  );
}
