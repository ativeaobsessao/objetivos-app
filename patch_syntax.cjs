const fs = require('fs');

let goalCode = fs.readFileSync('src/components/SortableGoalItem.tsx', 'utf8');
goalCode = goalCode.replace(
`  goal, isOverlay, isDraggingPlaceholder, setNodeRef, style, attributes, listeners
  index, total
}: GoalItemProps) {`,
`  goal, isOverlay, isDraggingPlaceholder, setNodeRef, style, attributes, listeners,
  index, total
}: GoalItemProps) {`
);
fs.writeFileSync('src/components/SortableGoalItem.tsx', goalCode);

let taskCode = fs.readFileSync('src/components/SortableTaskItem.tsx', 'utf8');
taskCode = taskCode.replace(
`  task, editingId, editTitle, isSaving, onEditChange, onSaveEdit, onCancelEdit,
  onTaskClick, onEditRequest, onDeleteRequest, isOverlay, isDraggingPlaceholder,
  setNodeRef, style, attributes, listeners
  index, total
}: TaskItemProps) {`,
`  task, editingId, editTitle, isSaving, onEditChange, onSaveEdit, onCancelEdit,
  onTaskClick, onEditRequest, onDeleteRequest, isOverlay, isDraggingPlaceholder,
  setNodeRef, style, attributes, listeners,
  index, total
}: TaskItemProps) {`
);
fs.writeFileSync('src/components/SortableTaskItem.tsx', taskCode);
