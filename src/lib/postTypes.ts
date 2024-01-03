import { DatabaseUser, DatabaseUserWithImage } from "./userTypes"

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