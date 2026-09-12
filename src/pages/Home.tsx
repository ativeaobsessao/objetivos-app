import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoals } from '../hooks/useDomain';
import { Plus, GripVertical, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { MobileLayout } from '../components/MobileLayout';
import { ThemeToggle } from '../components/ThemeToggle';
import { UserMenu } from '../components/UserMenu';
import { domainService } from '../services/domainService';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  TouchSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent, 
  DragStartEvent, 
  DragOverlay 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  arrayMove, 
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const QUOTES = [
  { text: "A vida não examinada não vale a pena ser vivida.", author: "Sócrates" },
  { text: "O que pode ser medido pode ser melhorado.", author: "Peter Drucker" },
  { text: "Não espere por circunstâncias ideais. Elas nunca chegam.", author: "Janet Erskine Stuart" },
  { text: "A disciplina é a ponte entre metas e realizações.", author: "Jim Rohn" },
  { text: "Você é o que você faz repetidamente. A excelência não é um ato, mas um hábito.", author: "Aristóteles" },
  { text: "Ação é a chave fundamental para todo sucesso.", author: "Pablo Picasso" }
];

function SortableGoalItem({ goal, index, total }: { goal: any, index: number, total: number } & { key?: React.Key }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const progress = goal.taskCount > 0 ? Math.round((goal.markCount / goal.taskCount) * 100) : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white dark:bg-gray-900 dark:border-gray-800 p-2 sm:p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center transition-all ${isDragging ? 'shadow-2xl ring-2 ring-gray-900/10 dark:ring-white/10 scale-[1.03] z-50' : ''}`}
      aria-label={`Objetivo ${goal.title}`}
    >
      <div
        className="drag-handle text-gray-400 cursor-grab active:cursor-grabbing p-3 sm:p-2 rounded-lg flex items-center justify-center touch-none"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="w-6 h-6" />
      </div>
      
      <Link
        to={`/objective/${goal.id}`}
        draggable={false}
        className="flex-1 flex justify-between items-center ml-2 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all select-none"
      >
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-gray-100 text-lg line-clamp-1">{goal.title}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : goal.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {goal.status === 'in_progress' ? 'Em andamento' : goal.status === 'completed' ? 'Concluído' : 'Não iniciado'}
            </span>
            <span className="text-xs text-gray-500 font-medium">{progress}% concluído</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center text-gray-400">
            <CalendarIcon className="w-4 h-4 mr-1" />
            <span className="text-xs font-bold">{goal.taskCount > 0 ? `${goal.taskCount} tarefas` : 'Sem tarefas'}</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </div>
      </Link>
    </div>
  );
}

export default function Home() {
  const { goals, loading, reload } = useGoals();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(QUOTES[0]);
  const [optimisticGoals, setOptimisticGoals] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setOptimisticGoals(goals);
  }, [goals]);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    domainService.migrateLocalData().then(() => {
      reload();
    });
  }, [reload]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      
      const oldIds = optimisticGoals.map(g => g.id);
      const newGoals = arrayMove<any>(optimisticGoals, oldIndex, newIndex);
      const newIds = newGoals.map(g => g.id);
      
      console.log('--- onDragEnd: Objetivos ---');
      console.log('IDs antes do arrayMove:', oldIds);
      console.log('IDs depois do arrayMove:', newIds);
      
      const updatedGoals = newGoals.map((g: any, idx) => ({ ...g, position: idx }));
      setOptimisticGoals(updatedGoals);
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const updates = updatedGoals.map(g => ({ id: g.id, position: g.position! }));
          await domainService.updateGoalOrderBatch(updates);
          reload();
        } catch (err) {
          console.error(err);
          setOptimisticGoals(goals);
        }
      }, 500);
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
              <DragOverlay>
                {activeId ? (
                  <div className="bg-white dark:bg-gray-900 dark:border-gray-800 p-2 sm:p-3 rounded-2xl shadow-2xl ring-2 ring-gray-900/10 dark:ring-white/10 flex items-center scale-[1.03]">
                    <div className="drag-handle text-gray-400 p-3 sm:p-2 flex items-center justify-center">
                      <GripVertical className="w-6 h-6" />
                    </div>
                    <div className="flex-1 flex justify-between items-center ml-2 p-2">
                      <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{optimisticGoals.find((g: any) => g.id === activeId)?.title}</span>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
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
