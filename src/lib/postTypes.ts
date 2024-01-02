import { DatabaseUser } from "./userTypes"

export interface CommentType {
  text: string,
  id: number, 
  postId: number,
  userId: string
  user: DatabaseUser
}