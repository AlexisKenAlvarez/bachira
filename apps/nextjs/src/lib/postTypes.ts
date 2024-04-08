import type { User } from "@bachira/db/schema/schema";

export interface CommentType {
  text: string;
  id: number;
  postId: number;
  userId: string;
  user: Pick<User, "id" | "name" | "image" | "username">;
}

export interface LikeType {
  id: number;
  postId: number;
  userId: string;
  user: Pick<User, "username">;
}

export interface PostEditType {
  postText: string;
  privacy: "PUBLIC" | "FOLLOWERS" | "PRIVATE";
  postId: number;
  author: string;
}

export type CommentPrivacyType = "PUBLIC" | "FOLLOWERS" | "PRIVATE";
