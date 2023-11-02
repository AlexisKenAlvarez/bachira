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
