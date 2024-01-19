import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createTRPCContext } from "@bachira/api";
import { getServerAuthSession } from "@bachira/auth";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () =>
      createTRPCContext({ headers: req.headers, session: await getServerAuthSession() }),
  });

export { handler as GET, handler as POST };

