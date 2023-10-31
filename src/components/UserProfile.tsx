"use client";
import { userDataOutput } from "@/lib/routerTypes";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import { User, UserCheck2, UserPlus2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface FollowerData {
  followers: {
    follower_id: string;
    following_id: string;
  }[];
  following: {
    follower_id: string;
    following_id: string;
  }[];
}

const UserProfile = ({
  userData,
  inProfile,
  isFollowing,
}: {
  userData: NonNullable<userDataOutput>;
  inProfile: boolean;
  isFollowing: boolean;
}) => {
  const currentUser = useUser();
  const [follows, setFollow] = useState<boolean>(isFollowing);
  const [userFollowData, setFollowData] = useState<FollowerData>({
    followers: userData[0]!.following,
    following: userData[0]!.follower,
  });

  const followUser = api.user.followUser.useMutation({
    onMutate: () => {
      const previousState = follows;
      const previousFollowData = userFollowData.followers;
      setFollowData((prevState) => ({
        ...prevState,
        followers: [
          ...prevState.followers,
          {
            follower_id: currentUser.user!.id,
            following_id: userData[0]!.id,
          },
        ],
      }));

      setFollow(true);

      return {
        previousLike: previousState,
        previousFollowData: previousFollowData,
      };
    },
    onError(error, _, context) {
      console.log(error);
      setFollow(context!.previousLike);
      setFollowData((prevState) => ({
        ...prevState,
        followers: context!.previousFollowData,
      }));
    },
    onSettled: () => {
      console.log("LIKE ACTION");
    },
  });

  const unfollow = api.user.unfollowUser.useMutation({
    onMutate: () => {
      const previousState = follows;
      const previousFollowData = userFollowData.followers;
      const filteredArr = userFollowData.followers.filter(
        (value) => value.follower_id !== currentUser.user!.id,
      );
      console.log(filteredArr);
      setFollowData((prevState) => ({ ...prevState, followers: filteredArr }));
      setFollow(false);

      return {
        previousLike: previousState,
        previousFollowData: previousFollowData,
      };
    },
    onError: (err, variables, context) => {
      console.log(err);
      setFollow(context!.previousLike);
      setFollowData((prevState) => ({
        ...prevState,
        followers: context!.previousFollowData,
      }));
    },
    onSettled: () => {
      console.log("DISLIKE ACTION");
    },
  });

  const handleFollow = async () => {
    try {
      if (userData && currentUser.isLoaded) {
        if (follows) {
          // Unfollow user
          console.log(currentUser.user!.id);
          await unfollow.mutateAsync({
            user_id: currentUser.user!.id,
          });
        } else {
          // Follow user
          await followUser.mutateAsync({
            followerId: currentUser.user!.id,
            followingId: userData[0]!.id,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {userData && (
        <div className="flex w-full flex-1 flex-col">
          <div className="-mb-5 flex h-64 w-full items-end justify-end bg-[#EDEDED]">
            {inProfile && (
              <Button className="m-5 mb-8" variant="outline">
                Edit cover photo
              </Button>
            )}
          </div>
          <div className="h-full w-full flex-1 rounded-tl-3xl rounded-tr-3xl border-l border-r border-t border-black/10 bg-white p-5">
            <div className="flex gap-4">
              <div className="bg-gchat h-28 w-28 shrink-0 rounded-full p-3">
                <User className="h-full w-full text-white" />
              </div>
              <div className="w-full">
                <div className="font-secondary flex h-auto w-full justify-between">
                  <div>
                    <h2 className=" text-xl font-bold">
                      @{userData[0]!.username}
                    </h2>
                    <h3 className="font-medium">
                      {userData[0]!.firstName} {userData[0]!.lastName}
                    </h3>
                  </div>
                  {!inProfile && (
                    <Button
                      className="px-7"
                      onClick={handleFollow}
                      disabled={!currentUser.isLoaded}
                      variant={follows ? "secondary" : "default"}
                    >
                      {follows ? (
                        <span className="flex items-center gap-2">
                          <UserCheck2 /> Following
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <UserPlus2 /> Follow
                        </span>
                      )}
                    </Button>
                  )}
                </div>
                <div className="font-secondary mt-8 flex gap-x-5">
                  <h2 className="font-medium">
                    <span className="text-xl font-bold">
                      {userFollowData.following.length}
                    </span>{" "}
                    Following
                  </h2>
                  <h2 className="font-medium">
                    <span className="text-xl font-bold">
                      {userFollowData.followers.length}
                    </span>{" "}
                    Followers
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
