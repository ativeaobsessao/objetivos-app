const fs = require('fs');

let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');
homeCode = homeCode.replace(
`<SortableGoalItem key={goal.id} goal={goal} />`,
`<SortableGoalItem key={goal.id} goal={goal} index={idx} total={optimisticGoals.length} />`
);
homeCode = homeCode.replace(
`{optimisticGoals.map((goal: any) => (`,
`{optimisticGoals.map((goal: any, idx: number) => (`
);
fs.writeFileSync('src/pages/Home.tsx', homeCode);


let tasksCode = fs.readFileSync('src/components/GoalTasks.tsx', 'utf8');
tasksCode = tasksCode.replace(
`<SortableTaskItem
                key={task.id}
                task={task}`,
`<SortableTaskItem
                key={task.id}
                task={task}
                index={idx}
                total={optimisticTasks.length}`
);
tasksCode = tasksCode.replace(
`{optimisticTasks.map(task => (`,
`{optimisticTasks.map((task, idx) => (`
);
fs.writeFileSync('src/components/GoalTasks.tsx', tasksCode);

