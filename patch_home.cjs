const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
`import { SortableGoalItem } from '../components/SortableGoalItem';`,
`import { SortableGoalItem, GoalItem } from '../components/SortableGoalItem';`
);

code = code.replace(
`import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';`,
`import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';`
);

code = code.replace(
`  useEffect(() => {
    setOptimisticGoals(goals);
  }, [goals]);`,
`  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticGoals(goals);
  }, [goals]);`
);

code = code.replace(
`    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),`,
`    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),`
);

code = code.replace(
`  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;`,
`  const handleDragStart = (event: DragStartEvent) => {
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
    }`
);

code = code.replace(
`        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>`,
`        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>`
);

code = code.replace(
`          </SortableContext>
        </DndContext>`,
`          </SortableContext>
          <DragOverlay>
            {activeId ? <GoalItem goal={optimisticGoals.find(g => g.id === activeId)!} isOverlay /> : null}
          </DragOverlay>
        </DndContext>`
);

fs.writeFileSync('src/pages/Home.tsx', code);
