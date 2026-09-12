const fs = require('fs');

function patchSensors(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace imports
  code = code.replace(
    /import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit\/core';/g,
    `import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';`
  );

  // If there's sortableKeyboardCoordinates missing, we need to import it
  if (!code.includes('sortableKeyboardCoordinates')) {
    code = code.replace(
      /import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit\/sortable';/,
      `import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';`
    );
  }

  // Replace sensors definition
  const sensorsRegex = /const sensors = useSensors\([\s\S]*?useSensor\(KeyboardSensor\)?[\s\S]*?\);/;
  const newSensors = `const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );`;
  
  if (sensorsRegex.test(code)) {
    code = code.replace(sensorsRegex, newSensors);
  } else {
    // fallback if regex doesn't match perfectly
    const sensorsFallbackRegex = /const sensors = useSensors\([\s\S]*?\);/;
    code = code.replace(sensorsFallbackRegex, newSensors);
  }

  fs.writeFileSync(filePath, code);
}

patchSensors('src/pages/Home.tsx');
patchSensors('src/components/GoalTasks.tsx');
