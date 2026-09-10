import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://tplgrqgpwjljodxqwoyb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwbGdycWdwd2psam9keHF3b3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5MzEyODEsImV4cCI6MjEwNDUwNzI4MX0.IfDPEQ7cTs-tAm47ZqomGrUpJar08cyCo64loTi1Qls');
async function run() {
  const { data, error } = await supabase.from('tasks').update({ completed: true }).eq('id', '85b38518-018d-4918-bb14-49f212735d95');
  console.log(error);
}
run();
