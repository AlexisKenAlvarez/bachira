import type { CookieOptions } from "@supabase/ssr";
import { cache } from "react";
import { headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { createCaller, createTRPCContext } from "@bachira/api";

import { env } from "@/env.mjs";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");
  const cookieStore = cookies();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );

  return createTRPCContext({
    headers: heads,
    supabase,
  });
});

export const api = createCaller(createContext);