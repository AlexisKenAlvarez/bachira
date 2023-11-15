"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userDataOutput } from "@/lib/routerTypes";
import { api } from "@/trpc/react";
import {
  Camera,
  ImagePlus,
  Settings,
  Trash2,
  UserCheck2,
  UserPlus2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import FollowData from "./FollowData";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { Image } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const { data: session, status } = useSession();
  const [open, setOpen] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
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
            followingId: userData[0]!.id,
            action: "unfollow",
          });
        } else {
          // Follow user
          await followUser.mutateAsync({
            followerName: session!.user.username,
            followerId: session!.user.id,
            followingId: userData[0]!.id,
            action: "follow",
            image: session!.user.image!,
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
              <DropdownMenu onOpenChange={(e) => {
                setOpen(e)
              }} open={open}>
                <DropdownMenuTrigger className="relative m-5 mb-8 rounded-md bg-white px-5 py-2 font-secondary text-sm font-semibold">
                  <p className="flex items-center gap-x-2">
                    <Camera
                      className="inline-block"
                      size={21}
                      fill="black"
                      stroke="white"
                    />
                    Edit cover
                  </p>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end" className="w-44">
                  <DropdownMenuItem className="relative space-x-2">
                    <Image className="inline-block" size="16" />
                    <p className="">Upload Photo</p>
                    <UploadButton<OurFileRouter, "imageUploader">
                      endpoint="imageUploader"
                      className="absolute left-0 top-0 block h-full w-full opacity-0"
                      appearance={{
                        allowedContent: {
                          display: "none",
                        },
                        container: {
                          width: "100%",
                        },
                      }}
                      onUploadBegin={() => {
                        toast.loading("Uploading image...", {
                          id: "cover_upload",
                        });
                      }}
                      onClientUploadComplete={(res: any) => {
                        console.log(res);
                        toast.success("Image uploaded successfully!", {
                          id: "cover_upload",
                        });
                      }}
                      onUploadError={(err: any) => {
                        console.log(err);
                        toast.error(
                          "Error uploading image. Please try again later.",
                        );
                      }}
                    />
                  </DropdownMenuItem>
                  <DropdownMenuItem className="space-x-2">
                    <Trash2 size={16} />
                    <p className="">Delete photo</p>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                    <h2 className=" commit w-44 truncate text-xl font-bold sm:w-60">
                      @{userData[0]!.username}
                    </h2>
                    <h3 className="font-medium">{userData[0]?.name}</h3>
                    {inProfile ? (
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
            <div className="relative mt-4 flex gap-x-5 font-secondary">
              <FollowData
                type="Following"
                value={userFollowData.following}
                userId={userData[0]!.id}
              />
              <FollowData
                type="Followers"
                value={userFollowData.followers}
                userId={userData[0]!.id}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
