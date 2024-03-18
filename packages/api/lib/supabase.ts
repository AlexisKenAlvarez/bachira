export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Database = {
  public: {
    Tables: {
      bans: {
        Row: {
          duration: string | null
          id: number
          reason: Database["public"]["Enums"]["reason_enum"]
          userId: string
        }
        Insert: {
          duration?: string | null
          id?: number
          reason: Database["public"]["Enums"]["reason_enum"]
          userId: string
        }
        Update: {
          duration?: string | null
          id?: number
          reason?: Database["public"]["Enums"]["reason_enum"]
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_bans_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      followership: {
        Row: {
          follower_id: string
          following_id: string
          id: number
        }
        Insert: {
          follower_id: string
          following_id: string
          id?: number
        }
        Update: {
          follower_id?: string
          following_id?: string
          id?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          createdAt: string | null
          id: number
          notificationFor: string
          notificationFrom: string
          postId: number | null
          seen: boolean
          status: Database["public"]["Enums"]["notification_status"] | null
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          createdAt?: string | null
          id?: number
          notificationFor: string
          notificationFrom: string
          postId?: number | null
          seen?: boolean
          status?: Database["public"]["Enums"]["notification_status"] | null
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          createdAt?: string | null
          id?: number
          notificationFor?: string
          notificationFrom?: string
          postId?: number | null
          seen?: boolean
          status?: Database["public"]["Enums"]["notification_status"] | null
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "public_notifications_notificationFor_fkey"
            columns: ["notificationFor"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_notifications_notificationFrom_fkey"
            columns: ["notificationFrom"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      postComments: {
        Row: {
          id: number
          postId: number
          text: string | null
          userId: string
        }
        Insert: {
          id?: number
          postId: number
          text?: string | null
          userId: string
        }
        Update: {
          id?: number
          postId?: number
          text?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_postComments_postId_fkey"
            columns: ["postId"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
        ]
      }
      postLikes: {
        Row: {
          id: number
          postId: number
          userId: string
        }
        Insert: {
          id?: number
          postId: number
          userId: string
        }
        Update: {
          id?: number
          postId?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_postLikes_postId_fkey"
            columns: ["postId"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
        ]
      }
      postReports: {
        Row: {
          id: number
          postId: number
          reportedById: string
          reporttype: Database["public"]["Enums"]["reporttype_enum"]
          status: Database["public"]["Enums"]["status_enum"] | null
          userId: string
        }
        Insert: {
          id?: number
          postId: number
          reportedById: string
          reporttype: Database["public"]["Enums"]["reporttype_enum"]
          status?: Database["public"]["Enums"]["status_enum"] | null
          userId: string
        }
        Update: {
          id?: number
          postId?: number
          reportedById?: string
          reporttype?: Database["public"]["Enums"]["reporttype_enum"]
          status?: Database["public"]["Enums"]["status_enum"] | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_postReports_postId_fkey"
            columns: ["postId"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_postReports_reportedById_fkey"
            columns: ["reportedById"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_postReports_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      posts: {
        Row: {
          createdAt: string | null
          id: number
          isDeleted: boolean
          privacy: Database["public"]["Enums"]["privacy_enum"] | null
          text: string | null
          updatedAt: string | null
          userId: string
        }
        Insert: {
          createdAt?: string | null
          id?: number
          isDeleted?: boolean
          privacy?: Database["public"]["Enums"]["privacy_enum"] | null
          text?: string | null
          updatedAt?: string | null
          userId: string
        }
        Update: {
          createdAt?: string | null
          id?: number
          isDeleted?: boolean
          privacy?: Database["public"]["Enums"]["privacy_enum"] | null
          text?: string | null
          updatedAt?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_posts_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
      user: {
        Row: {
          bio: string | null
          countId: number
          coverPhoto: string | null
          createdAt: string | null
          email: string
          emailVerified: string | null
          gender: Database["public"]["Enums"]["gender_enum"] | null
          id: string
          image: string
          name: string
          updatedAt: string | null
          username: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          countId?: number
          coverPhoto?: string | null
          createdAt?: string | null
          email: string
          emailVerified?: string | null
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          id: string
          image: string
          name: string
          updatedAt?: string | null
          username: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          countId?: number
          coverPhoto?: string | null
          createdAt?: string | null
          email?: string
          emailVerified?: string | null
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          id?: string
          image?: string
          name?: string
          updatedAt?: string | null
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      userReports: {
        Row: {
          id: number
          reportedById: string
          reporttype: Database["public"]["Enums"]["reporttype_user_enum"]
          status: Database["public"]["Enums"]["status_enum"]
          userId: string
        }
        Insert: {
          id?: number
          reportedById: string
          reporttype: Database["public"]["Enums"]["reporttype_user_enum"]
          status?: Database["public"]["Enums"]["status_enum"]
          userId: string
        }
        Update: {
          id?: number
          reportedById?: string
          reporttype?: Database["public"]["Enums"]["reporttype_user_enum"]
          status?: Database["public"]["Enums"]["status_enum"]
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_userReports_reportedById_fkey"
            columns: ["reportedById"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_userReports_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      gender_enum: "MALE" | "FEMALE" | "IDK"
      notification_status: "READ" | "UNREAD"
      notification_type:
        | "FOLLOW"
        | "LIKE_POST"
        | "LIKE_COMMENT"
        | "LIKE_REPLY"
        | "MENTION_POST"
        | "MENTION_COMMENT"
        | "COMMENT"
        | "REPLY"
      privacy_enum: "PUBLIC" | "FOLLOWERS" | "PRIVATE"
      reason_enum:
        | "SEXUAL_CONTENT"
        | "HATEFUL_CONTENT"
        | "VIOLENT_CONTENT"
        | "HARASSMENT"
        | "SPAM"
        | "CHILD_ABUSE"
        | "PRETENDING_TO_BE_SOMEONE"
      reporttype_enum:
        | "SEXUAL_CONTENT"
        | "HATEFUL_CONTENT"
        | "VIOLENT_CONTENT"
        | "SPAM"
        | "CHILD_ABUSE"
      reporttype_user_enum:
        | "SEXUAL_CONTENT"
        | "HATEFUL_CONTENT"
        | "VIOLENT_CONTENT"
        | "HARASSMENT"
        | "SPAM"
        | "CHILD_ABUSE"
        | "PRETENDING_TO_BE_SOMEONE"
      status_enum: "PENDING" | "RESOLVED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
