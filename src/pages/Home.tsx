import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoals } from '../hooks/useDomain';
import { MobileLayout } from '../components/MobileLayout';
import { Plus } from 'lucide-react';
import { UserMenu } from '../components/UserMenu';
import { domainService } from '../services/domainService';
import { ThemeToggle } from '../components/ThemeToggle';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SortableGoalItem, GoalItem } from '../components/SortableGoalItem';
import { useDebouncedBatchUpdate } from '../hooks/useDebouncedBatchUpdate';

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
  const [optimisticGoals, setOptimisticGoals] = useState<any[]>([]);

  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticGoals(goals);
  }, [goals]);

  useEffect(() => {
    // Pick a random quote
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    
    // Run migration if needed
    domainService.migrateLocalData().then(() => {
      reload();
    });
  }, [reload]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const debouncedBatchUpdate = useDebouncedBatchUpdate(500);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };


  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    if (over && active.id !== over.id) {
      const oldIndex = optimisticGoals.findIndex((g) => g.id === active.id);
      const newIndex = optimisticGoals.findIndex((g) => g.id === over.id);
      
      const newGoals = arrayMove(optimisticGoals, oldIndex, newIndex);
      
      // Update position field based on array index locally
      const updatedGoals = newGoals.map((g: any, idx) => ({ ...g, position: idx }));
      setOptimisticGoals(updatedGoals);
      
      // Utilizando o hook utilitário para atualização em lote
      debouncedBatchUpdate(
        async () => {
          const updates = updatedGoals.map(g => ({ id: g.id, position: g.position! }));
          await domainService.updateGoalOrderBatch(updates);
        },
        () => reload(),
        (err) => {
          console.error(err);
          setOptimisticGoals(goals); // revert on error
        }
      );
    }
  };
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
            
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
              <SortableContext items={optimisticGoals.map(g => g.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-3">
                  {optimisticGoals.map((goal: any, idx: number) => (
                    <SortableGoalItem key={goal.id} goal={goal} index={idx} total={optimisticGoals.length} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
            <Link
              to="/create"
              className="flex items-center justify-center gap-2 bg-gray-50 text-gray-900 dark:text-black border border-gray-200 px-5 py-4 rounded-2xl font-medium active:bg-gray-100 transition-colors mt-4"
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
