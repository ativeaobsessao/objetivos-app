const fs = require('fs');

let goalCode = fs.readFileSync('src/components/SortableGoalItem.tsx', 'utf8');
goalCode = goalCode.replace(
`export function SortableGoalItem(props: Omit<GoalItemProps, 'isOverlay' | 'isDraggingPlaceholder' | 'setNodeRef' | 'style' | 'attributes' | 'listeners'>) {`,
`export function SortableGoalItem(props: Omit<GoalItemProps, 'isOverlay' | 'isDraggingPlaceholder' | 'setNodeRef' | 'style' | 'attributes' | 'listeners'> & { key?: React.Key }) {`
);
fs.writeFileSync('src/components/SortableGoalItem.tsx', goalCode);

let taskCode = fs.readFileSync('src/components/SortableTaskItem.tsx', 'utf8');
taskCode = taskCode.replace(
`export function SortableTaskItem(props: Omit<TaskItemProps, 'isOverlay' | 'isDraggingPlaceholder' | 'setNodeRef' | 'style' | 'attributes' | 'listeners'>) {`,
`export function SortableTaskItem(props: Omit<TaskItemProps, 'isOverlay' | 'isDraggingPlaceholder' | 'setNodeRef' | 'style' | 'attributes' | 'listeners'> & { key?: React.Key }) {`
);
fs.writeFileSync('src/components/SortableTaskItem.tsx', taskCode);
