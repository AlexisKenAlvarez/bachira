import { z } from "zod";

export const signupSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
})

export type signupType = z.infer<typeof signupSchema>