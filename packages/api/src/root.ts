import { notificationRouter } from "./routers/notifications";
import { postRouter } from "./routers/posts";
import { userRouter } from "./routers/users";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  // authentication: authenticationRouter,
  notifications: notificationRouter,
  posts: postRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
