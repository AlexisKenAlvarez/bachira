import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@bachira/api";

export const api = createTRPCReact<AppRouter>({});