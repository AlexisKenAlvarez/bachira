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

export const editProfileSchema = z.object({
  website: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(150).optional(),
  gender: z.enum(["MALE", "FEMALE", 'IDK']).optional(),
});

export type signupType = z.infer<typeof signupSchema>;
