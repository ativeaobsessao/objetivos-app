-- Adicionar coluna 'position' na tabela de objetivos
ALTER TABLE goals ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Adicionar coluna 'position' na tabela de tarefas
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Atualizar posições existentes baseadas na data de criação (para manter a ordem atual)
WITH ranked_goals AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as new_pos
  FROM goals
)
UPDATE goals SET position = ranked_goals.new_pos FROM ranked_goals WHERE goals.id = ranked_goals.id;

WITH ranked_tasks AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as new_pos
  FROM tasks
)
UPDATE tasks SET position = ranked_tasks.new_pos FROM ranked_tasks WHERE tasks.id = ranked_tasks.id;
