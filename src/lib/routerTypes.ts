import { UserRouter } from '@/server/api/routers/users';
import type { inferRouterOutputs } from '@trpc/server';

type UserRouterOutput = inferRouterOutputs<UserRouter>

export type userDataOutput = UserRouterOutput['getUser']
