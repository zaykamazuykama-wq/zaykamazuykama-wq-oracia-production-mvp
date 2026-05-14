import { createClient } from '@supabase/supabase-js';

type RuntimeSupabaseClient = any;

let cachedClient: RuntimeSupabaseClient | null = null;

export function getSupabaseClient(): RuntimeSupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('supabase_env_missing');
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  }) as RuntimeSupabaseClient;

  return cachedClient;
}

export const supabase = new Proxy({} as RuntimeSupabaseClient, {
  get(_target, property, receiver) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, property, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
