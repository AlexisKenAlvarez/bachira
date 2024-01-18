import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createTRPCContext } from "@bachira/api";
import { auth } from "@bachira/auth";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () =>
      createTRPCContext({ headers: req.headers, session: await auth() }),
  });

export { handler as GET, handler as POST };