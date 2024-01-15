import PusherServer from 'pusher';
import { z } from 'zod';

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: 'ap1',
  useTLS: true
});

export function toPusherKey(key: string) {
  return key.replace(/:/g, "__");
}

export const editProfileSchema = z.object({
  website: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(150).optional(),
  gender: z.enum(["MALE", "FEMALE", 'IDK']).optional(),
});