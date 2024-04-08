/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/env.mjs"; 

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export const supabase = createBrowserClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)