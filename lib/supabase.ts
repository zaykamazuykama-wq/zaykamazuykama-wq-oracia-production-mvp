import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type UntypedSupabaseClient = SupabaseClient<any, any, any>;

let cachedClient: UntypedSupabaseClient | null = null;

export function getSupabaseClient(): UntypedSupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('supabase_env_missing');
  }

  cachedClient = createClient<any, any, any>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cachedClient;
}

export const supabase = new Proxy({} as UntypedSupabaseClient, {
  get(_target, property, receiver) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, property, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
