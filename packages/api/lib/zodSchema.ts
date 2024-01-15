import { z } from "zod";

export const signupSchema = z.object({
  id: z.string(),
  username: z.string(),
  bio: z.string().nullable(),
  image: z.string().nullable(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
})

export const FollowershipSchema = z.object({
  id: z.number(),
  following_id: z.string(),
  follower_id: z.string()
})

export type signupType = z.infer<typeof signupSchema>;