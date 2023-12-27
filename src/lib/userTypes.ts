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