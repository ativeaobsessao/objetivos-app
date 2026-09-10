import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://tplgrqgpwjljodxqwoyb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwbGdycWdwd2psam9keHF3b3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MzEyODEsImV4cCI6MjEwNDUwNzI4MX0.IfDPEQ7cTs-tAm47ZqomGrUpJar08cyCo64loTi1Qls');
async function run() {
  const { data: goals } = await supabase.from('goals').select('*').limit(1);
  const { data: marks } = await supabase.from('goal_marks').select('*').limit(1);
  console.log('goals', goals);
  console.log('marks', marks);
}
run();
