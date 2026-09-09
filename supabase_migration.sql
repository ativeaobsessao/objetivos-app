-- Migração para Supabase (Executar no SQL Editor do seu projeto Supabase)

-- 1. Criação das tabelas (caso ainda não existam)
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goal_task_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(goal_id, task_id)
);

CREATE TABLE IF NOT EXISTS goal_marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    mark_date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(goal_id, mark_date)
);

-- 2. Adicionar o user_id para vincular os dados ao Supabase Auth
-- O "auth.uid()" será o default, garantindo que mesmo inserts sem explicitar o user_id peguem o usuário correto da sessão.
ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid() NOT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid() NOT NULL;
ALTER TABLE goal_task_links ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid() NOT NULL;
ALTER TABLE goal_marks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid() NOT NULL;

-- 3. Habilitar o RLS (Row Level Security)
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_task_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_marks ENABLE ROW LEVEL SECURITY;

-- 4. Criar as Policies (Regras de acesso) para garantir o isolamento entre contas
-- Dropando se existirem para podermos re-rodar sem erro
DROP POLICY IF EXISTS "Ver os próprios objetivos" ON goals;
CREATE POLICY "Ver os próprios objetivos" ON goals FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Inserir próprios objetivos" ON goals;
CREATE POLICY "Inserir próprios objetivos" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Atualizar próprios objetivos" ON goals;
CREATE POLICY "Atualizar próprios objetivos" ON goals FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Deletar próprios objetivos" ON goals;
CREATE POLICY "Deletar próprios objetivos" ON goals FOR DELETE USING (auth.uid() = user_id);

-- Tasks
DROP POLICY IF EXISTS "Ver próprias tasks" ON tasks;
CREATE POLICY "Ver próprias tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Inserir próprias tasks" ON tasks;
CREATE POLICY "Inserir próprias tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Atualizar próprias tasks" ON tasks;
CREATE POLICY "Atualizar próprias tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);

-- Goal Task Links
DROP POLICY IF EXISTS "Ver próprios links" ON goal_task_links;
CREATE POLICY "Ver próprios links" ON goal_task_links FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Inserir próprios links" ON goal_task_links;
CREATE POLICY "Inserir próprios links" ON goal_task_links FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Deletar próprios links" ON goal_task_links;
CREATE POLICY "Deletar próprios links" ON goal_task_links FOR DELETE USING (auth.uid() = user_id);

-- Goal Marks
DROP POLICY IF EXISTS "Ver próprias marcas" ON goal_marks;
CREATE POLICY "Ver próprias marcas" ON goal_marks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Inserir próprias marcas" ON goal_marks;
CREATE POLICY "Inserir próprias marcas" ON goal_marks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Deletar próprias marcas" ON goal_marks;
CREATE POLICY "Deletar próprias marcas" ON goal_marks FOR DELETE USING (auth.uid() = user_id);
