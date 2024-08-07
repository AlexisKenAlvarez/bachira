"use client";
import type { FollowData as FollowDataType } from "@/lib/userTypes";
import { api } from "@/trpc/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";
import type { RouterOutputs } from "@bachira/api";
import type { Session } from "@supabase/supabase-js";
import {
  Link as LinkIcon,
  Settings,
  UserCheck2,
  UserPlus2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import CoverButton from "./CoverButton";
import FollowData from "./FollowData";

const UserProfile = ({
  userData,
  inProfile,
  isFollowing,
  session
}: {
  session: Session["user"];
  userData: RouterOutputs["user"]["getUser"];
  inProfile: boolean;
  isFollowing: boolean;
}) => {

  const [follows, setFollow] = useState<boolean>(isFollowing);
  const [userFollowData, setFollowData] = useState<FollowDataType>({
    followers: userData!.followers ?? 0,
    following: userData!.following ?? 0,
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
            followerId: session.id,
            followingId: userData.id,
            action: "unfollow",
          });
        } else {
          // Follow user
          await followUser.mutateAsync({
            followerName: session.user_metadata.username as string,
            followerId: session.id,
            followingId: userData.id,
            action: "follow",
            image: session.user_metadata.avatar_url as string,
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
        <div className="flex w-full flex-1 flex-col bg-white">
          <div className="relative -mb-5 flex h-[18rem] w-full items-end justify-end bg-slate-200">

            {userData.coverPhoto && (
              <Image
                width={800}
                height={800}
                src={userData.coverPhoto}
                alt="Cover Photo"
                className="absolute bottom-0 left-0 top-0 my-auto h-full w-full object-cover object-center"
              />
            )}
            {inProfile && <CoverButton userData={userData} />}
          </div>
          <div className="relative z-10 h-full w-full rounded-tl-3xl rounded-tr-3xl border-t border-black/10 bg-white p-5">
            <div className="flex gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userData.image ?? ''} className="object-cover" />
                <AvatarFallback>
                  <Skeleton className="h-full w-full rounded-full" />
                </AvatarFallback>
              </Avatar>
              <div className="w-full">
                <div className="flex h-auto w-full justify-between font-primary">
                  <div className="">
                    <h2 className=" commit w-44 truncate text-xl font-bold sm:w-60">
                      @{userData.username}
                    </h2>
                    <h3 className="font-medium">{userData.name}</h3>
                    {inProfile ? (
                      <Link href={"/profile/edit"}>
                        <Button
                          className="group mt-2 gap-x-2 px-6 text-sm font-semibold"
                          disabled={status === "loading"}
                          variant="secondary"
                        >
                          <Settings
                            size={18}
                            className="duration-500 ease-in-out group-hover:rotate-180"
                          />
                          Edit Profile
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        className="mt-2 px-7"
                        onClick={handleFollow}
                        disabled={status === "loading"}
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
            <div className="relative mt-4 flex gap-x-5 font-primary">
              <FollowData
                type="Following"
                value={userFollowData.following}
                userId={userData.id!}
              />
              <FollowData
                type="Followers"
                value={userFollowData.followers}
                userId={userData.id!}
              />
            </div>

            <div className="mt-2 ">
              <pre className="font-primary text-sm">{userData.bio}</pre>
            </div>

            {userData.website && (
              <div className="mt-2 font-primary flex items-center gap-2">
                <LinkIcon size="14" className="text-primary font-bold" strokeWidth={2.5} />
                <Link
                  href={userData.website ?? ""}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <p className="text-sm font-semibold text-primary">
                    {userData.website}
                  </p>
                </Link>
              </div>
            )}
          </div>
          <div className="flex flex-1 w-full bg-white"></div>
        </div>
      )}
    </>

  );
};

export default UserProfile;
