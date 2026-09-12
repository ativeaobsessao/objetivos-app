const fs = require('fs');

// Patch Home.tsx
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');
home = home.replace(
  `import { useGoals } from '../hooks/useGoals';`,
  `import { useGoals } from '../hooks/useDomain';`
);
home = home.replace(
  `function SortableGoalItem({ goal, index, total }: { goal: any, index: number, total: number }) {`,
  `function SortableGoalItem({ goal, index, total }: { goal: any, index: number, total: number } & { key?: React.Key }) {`
);
home = home.replace(
  `optimisticGoals.find(g => g.id === activeId)?.title`,
  `optimisticGoals.find((g: any) => g.id === activeId)?.title`
);
fs.writeFileSync('src/pages/Home.tsx', home);

// Patch GoalTasks.tsx
let tasks = fs.readFileSync('src/components/GoalTasks.tsx', 'utf8');
tasks = tasks.replace(
  `import { getTodayLocal } from '../lib/utils';`,
  `import { getTodayLocal } from '../utils/dates';`
);
tasks = tasks.replace(
  `optimisticTasks.find(t => t.id === activeId)?.title`,
  `optimisticTasks.find((t: any) => t.id === activeId)?.title`
);
tasks = tasks.replace(
  `export function GoalTasks(`,
  `export function GoalTasks(`
); // just a placeholder to check if we can add key manually to SortableTaskItem

tasks = tasks.replace(
  `function SortableTaskItem({ `,
  `function SortableTaskItem({ key, `
);
// SortableTaskItem signature is `{ task, ... }: any`. `key` is allowed when type is `any` but React doesn't extract it unless we spread. We don't need to specify `key` in props destructuring if it's `any`. Actually `SortableTaskItem` has `any` as props, so it should accept `key`.

fs.writeFileSync('src/components/GoalTasks.tsx', tasks);
