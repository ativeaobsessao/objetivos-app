const fs = require('fs');

// GOAL ITEM
let goalCode = fs.readFileSync('src/components/SortableGoalItem.tsx', 'utf8');
goalCode = goalCode.replace(
`export interface GoalItemProps {
  goal: any;`,
`export interface GoalItemProps {
  goal: any;
  index?: number;
  total?: number;`
);

goalCode = goalCode.replace(
`}: GoalItemProps) {`,
`  index, total
}: GoalItemProps) {`
);

goalCode = goalCode.replace(
`aria-label={\`Objetivo \${goal.title}\`}`,
`aria-label={index !== undefined && total !== undefined ? \`Item \${index + 1} de \${total}\` : \`Objetivo \${goal.title}\`}`
);

goalCode = goalCode.replace(
`export function SortableGoalItem(props: Omit<GoalItemProps, 'isOverlay' | 'isDraggingPlaceholder' | 'setNodeRef' | 'style' | 'attributes' | 'listeners'>) {`,
`export function SortableGoalItem(props: Omit<GoalItemProps, 'isOverlay' | 'isDraggingPlaceholder' | 'setNodeRef' | 'style' | 'attributes' | 'listeners'>) {`
);

fs.writeFileSync('src/components/SortableGoalItem.tsx', goalCode);

// TASK ITEM
let taskCode = fs.readFileSync('src/components/SortableTaskItem.tsx', 'utf8');
taskCode = taskCode.replace(
`export interface TaskItemProps {
  task: Task;`,
`export interface TaskItemProps {
  task: Task;
  index?: number;
  total?: number;`
);

taskCode = taskCode.replace(
`}: TaskItemProps) {`,
`  index, total
}: TaskItemProps) {`
);

taskCode = taskCode.replace(
`aria-label={\`Tarefa \${task.title}\`}`,
`aria-label={index !== undefined && total !== undefined ? \`Item \${index + 1} de \${total}\` : \`Tarefa \${task.title}\`}`
);

fs.writeFileSync('src/components/SortableTaskItem.tsx', taskCode);

