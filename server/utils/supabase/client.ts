
import { createBrowserClient } from "@supabase/ssr";
import { createClient as createServerClient } from "@supabase/supabase-js";

const supabaseUrl = typeof window !== "undefined"
  ? process.env.NEXT_PUBLIC_SUPABASE_URL
  : process.env.SUPABASE_URL;
const supabaseKey = typeof window !== "undefined"
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  : process.env.SUPABASE_KEY;

export const createClient = () =>
  typeof window !== "undefined"
    ? createBrowserClient(supabaseUrl!, supabaseKey!)
    : createServerClient(supabaseUrl!, supabaseKey!);
