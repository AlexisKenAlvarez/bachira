import type { UserRouter } from '@bachira/api/src/routers/users';
import type { inferRouterOutputs } from '@trpc/server';

type UserRouterOutput = inferRouterOutputs<UserRouter>

export type userDataOutput = UserRouterOutput['getUser']

export type userData = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  created_at: Date;
  updated_at: Date;
  following: number;
  followers: number;
}[]