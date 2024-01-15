import type { RouterOutputs } from "@bachira/api"
import type { DatabaseUser, DatabaseUserWithImage } from "./userTypes"

export interface CommentType {
  text: string,
  id: number, 
  postId: number,
  userId: string
  user: DatabaseUserWithImage
}

export interface LikeType {
  id: number, 
  postId: number,
  userId: string
  user: DatabaseUser
}

export interface PostEditType {
  postText: string,
  privacy: "PUBLIC" | "FOLLOWERS" | "PRIVATE"
  postId: number,
  author: string
}

export type CommentPrivacyType = "PUBLIC" | "FOLLOWERS" | "PRIVATE" 
export type PostType = RouterOutputs["posts"]["getPosts"]["postData"][0];