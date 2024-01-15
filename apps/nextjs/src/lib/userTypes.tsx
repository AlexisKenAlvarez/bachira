import { RouterOutputs } from "@bachira/api";
import { z } from "zod";

export interface FollowerData {
  followers: FollowerType[];
  following: FollowingType[];
}

export interface FollowerType {
  follower_id: string;
  following_id: string;
}

export interface FollowingType {
  follower_id: string;
  following_id: string;
}

export interface UserInterface {
  countId: number;
  id: string;
  bio: string | null;
  coverPhoto: string | null;
  username: string | null;
  email: string;
  name: string | null;
  website: string | null;
  gender: "MALE" | "FEMALE" | "IDK" | null
  created_at: Date;
  emailVerified: Date | null;
  image: string | null;
  updatedAt: Date;
}

export interface SessionUser {
  countId: number
  id: string;
  username: string;
  coverPhoto: string;
  image: string | null;
  name?: string | null | undefined;
  email?: string | null | undefined;
}

export interface DatabaseUser {
  username: string | null;
}

export interface DatabaseUserWithImage {
  name: string | null
  id: string;
  username: string | null;
  image: string | null
}

export interface FollowData {
  followers: number;
  following: number;
}

export interface DialogUserType {
  userImage: string;
  username: string;
  userId: string;
}

export interface MentionedType {
  username: string;
  image: string;
  id: string;
}

export const editProfileSchema = z.object({
  website: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(150).optional(),
  gender: z.enum(["MALE", "FEMALE", 'IDK']).optional(),
});



export type UserFollowingType = RouterOutputs["user"]["postFollowing"]["userFollowing"]