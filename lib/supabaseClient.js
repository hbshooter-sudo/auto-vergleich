import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Falls die Env-Variable in Vercel fehlt oder leer ist, nutzen wir direkt deine Werte
const supabaseUrl = (rawUrl && rawUrl.startsWith('http')) 
  ? rawUrl 
  : 'https://ggqcmqcptwvzhuivfbv1.supabase.co';

const supabaseAnonKey = rawKey || 'sbpublishable-PtrOK_5RMXee4XxrZb4CA_FEQ1E1Ak';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
