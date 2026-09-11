const fs = require('fs');
let code = fs.readFileSync('src/components/GoalTasks.tsx', 'utf8');

code = code.replace(
`  useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);`,
`  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);`
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
`      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>`,
`      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>`
);

code = code.replace(
`        </SortableContext>
      </DndContext>`,
`        </SortableContext>
        <DragOverlay>
          {activeId ? <TaskItem task={optimisticTasks.find(t => t.id === activeId)!} isOverlay /> : null}
        </DragOverlay>
      </DndContext>`
);

fs.writeFileSync('src/components/GoalTasks.tsx', code);
