"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userDataOutput } from "@/lib/routerTypes";
import { FollowerData } from "@/lib/userTypes";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import { Settings, UserCheck2, UserPlus2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import FollowData from "./FollowData";

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
  const [followModal, setFollowModal] = useState("")

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
              <Avatar className="h-24 w-24">
                <AvatarImage src="/fox.webp" />
                <AvatarFallback>
                  <Skeleton className="h-full w-full rounded-full" />
                </AvatarFallback>
              </Avatar>
              <div className="w-full">
                <div className="flex h-auto w-full justify-between font-secondary">
                  <div className="">
                    <h2 className=" w-44 truncate text-xl font-bold sm:w-60">
                      @{userData[0]!.username}
                    </h2>
                    <h3 className="font-medium">
                      {userData[0]!.firstName} {userData[0]!.lastName}
                    </h3>
                    {inProfile ? (
                      <Button
                        className="mt-2 gap-x-2 px-6 text-sm font-semibold"
                        disabled={!currentUser.isLoaded}
                        variant="secondary"
                      >
                        <Settings size={18} />
                        Edit Profile
                      </Button>
                    ) : (
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
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-x-5 font-secondary">
              <FollowData type="Following" value={userFollowData.following} />
              <FollowData type="Followers" value={userFollowData.followers} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
