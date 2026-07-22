import { createClient } from '@supabase/supabase-js';

// Nutze die Umgebungsvariablen oder passe den Fallback an
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ggqcmqcptwvzhuivfbv1.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sbpublishable-PtrOK_5RMXee4XxrZb4CA_FEQ1E1Ak';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
