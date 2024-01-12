import { userRouter } from "@/server/api/routers/users";
import { createTRPCRouter } from "@/server/api/trpc";
import { authenticationRouter } from "./routers/authentication";
import { notificationRouter } from "./routers/notifications";
import { postRouter } from "./routers/posts";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  authentication: authenticationRouter,
  notifications: notificationRouter,
  posts: postRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
