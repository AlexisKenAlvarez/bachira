"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userDataOutput } from "@/lib/routerTypes";
import { api } from "@/trpc/react";
import { Settings, UserCheck2, UserPlus2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import FollowData from "./FollowData";
interface FollowData {
  followers: number;
  following: number;
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
  const { data: session, status } = useSession()
  const [follows, setFollow] = useState<boolean>(isFollowing);
  const [userFollowData, setFollowData] = useState<FollowData>({
    followers: Number(userData[0]!.followers as number),
    following: Number(userData[0]!.following as number),
  });

  const followUser = api.user.followUser.useMutation({
    onMutate: () => {
      const previousState = follows;
      const previousFollowData = userFollowData.followers;
      setFollowData((prevState) => ({
        ...prevState,
        followers: prevState.followers + 1,
      }));

      setFollow(true);

      return {
        previousLike: previousState,
        previousFollowData: previousFollowData,
      };
    },
    onError(err, _, context) {
      const errMessage = err.message;

      if (errMessage === "TOO_MANY_REQUESTS") {
        toast.error("You are doing that too much. Try again later.");
      }

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

  const unfollow = api.user.followUser.useMutation({
    onMutate: () => {
      const previousState = follows;
      const previousFollowData = userFollowData.followers;

      setFollowData((prevState) => ({
        ...prevState,
        followers: prevState.followers - 1,
      }));

      setFollow(false);

      return {
        previousLike: previousState,
        previousFollowData: previousFollowData,
      };
    },
    onError: (err, variables, context) => {
      const errMessage = err.message;

      if (errMessage === "TOO_MANY_REQUESTS") {
        toast.error("You are doing that too much. Try again later.");
      }

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
      if (userData) {
        if (follows) {
          // Unfollow user
          await unfollow.mutateAsync({
            followerId: session!.user.id,
            action: "unfollow"
          });
        } else {
          // Follow user
          await followUser.mutateAsync({
            followerId: session!.user.id,
            followingId: userData[0]!.id,
            action: "follow"
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
                <AvatarImage src={userData[0]?.image as string} />
                <AvatarFallback>
                  <Skeleton className="h-full w-full rounded-full" />
                </AvatarFallback>
              </Avatar>
              <div className="w-full">
                <div className="flex h-auto w-full justify-between font-secondary">
                  <div className="">
                    <h2 className=" w-44 truncate text-xl font-bold sm:w-60 commit">
                      @{userData[0]!.username}
                    </h2>
                    <h3 className="font-medium">
                      {userData[0]?.name}
                    </h3>
                    {inProfile ? (
                      <Button
                        className="group mt-2 gap-x-2 px-6 text-sm font-semibold"
                        disabled={status === 'loading'}
                        variant="secondary"
                      >
                        <Settings
                          size={18}
                          className="duration-500 ease-in-out group-hover:rotate-180"
                        />
                        Edit Profile
                      </Button>
                    ) : (
                      <Button
                        className="mt-2 px-7"
                        onClick={handleFollow}
                        disabled={status === 'loading'}
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
            <div className="mt-4 flex gap-x-5 font-secondary relative">
              <FollowData type="Following" value={userFollowData.following} userId={userData[0]!.id} />
              <FollowData type="Followers" value={userFollowData.followers} userId={userData[0]!.id} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
