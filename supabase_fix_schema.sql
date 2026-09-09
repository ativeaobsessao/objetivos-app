-- 1. Força a criação das colunas de usuário caso elas não existam
-- Permite NULL temporariamente para não falhar caso já existam linhas antigas de teste
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.goal_task_links ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.goal_marks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Limpa dados de testes antigos (órfãos) que foram criados antes da autenticação existir.
-- Se eles não têm dono atrelado, eles violariam a segurança e causariam erros na etapa 3.
DELETE FROM public.goals WHERE user_id IS NULL;
DELETE FROM public.tasks WHERE user_id IS NULL;
DELETE FROM public.goal_task_links WHERE user_id IS NULL;
DELETE FROM public.goal_marks WHERE user_id IS NULL;

-- 3. Agora é seguro aplicar a restrição NOT NULL para garantir a integridade dos dados
ALTER TABLE public.goals ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.goals ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.tasks ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.tasks ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.goal_task_links ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.goal_task_links ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.goal_marks ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.goal_marks ALTER COLUMN user_id SET NOT NULL;

-- 4. Atualizar as Políticas RLS (Row Level Security)
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_task_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_marks ENABLE ROW LEVEL SECURITY;

-- Goals Policies
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios objetivos" ON public.goals;
CREATE POLICY "Usuários podem ver apenas seus próprios objetivos" ON public.goals FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar seus próprios objetivos" ON public.goals;
CREATE POLICY "Usuários podem criar seus próprios objetivos" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem editar seus próprios objetivos" ON public.goals;
CREATE POLICY "Usuários podem editar seus próprios objetivos" ON public.goals FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios objetivos" ON public.goals;
CREATE POLICY "Usuários podem deletar seus próprios objetivos" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- Tasks Policies
DROP POLICY IF EXISTS "Tasks visibility" ON public.tasks;
CREATE POLICY "Tasks visibility" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Tasks insert" ON public.tasks;
CREATE POLICY "Tasks insert" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Tasks update" ON public.tasks;
CREATE POLICY "Tasks update" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Tasks delete" ON public.tasks;
CREATE POLICY "Tasks delete" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Goal Task Links Policies
DROP POLICY IF EXISTS "Links visibility" ON public.goal_task_links;
CREATE POLICY "Links visibility" ON public.goal_task_links FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Links insert" ON public.goal_task_links;
CREATE POLICY "Links insert" ON public.goal_task_links FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Links delete" ON public.goal_task_links;
CREATE POLICY "Links delete" ON public.goal_task_links FOR DELETE USING (auth.uid() = user_id);

-- Goal Marks Policies
DROP POLICY IF EXISTS "Marks visibility" ON public.goal_marks;
CREATE POLICY "Marks visibility" ON public.goal_marks FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Marks insert" ON public.goal_marks;
CREATE POLICY "Marks insert" ON public.goal_marks FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Marks delete" ON public.goal_marks;
CREATE POLICY "Marks delete" ON public.goal_marks FOR DELETE USING (auth.uid() = user_id);

-- 5. FORÇAR O RELOAD DO CACHE DO POSTGREST PARA EVITAR O ERRO PGRST204
NOTIFY pgrst, 'reload schema';
