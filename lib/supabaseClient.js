import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL  'https://gcqcmqcptwvzhuivfbvi.supabase.co/';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  'sbpublishable-PtrOK_5RmXee4XxrZb4CA_FEQ1E1Ak';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
