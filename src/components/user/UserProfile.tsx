"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userDataOutput } from "@/lib/routerTypes";
import { api } from "@/trpc/react";
import type { FileWithPath } from "@uploadthing/react";
import { useDropzone } from "@uploadthing/react/hooks";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useOutsideClick } from "@/utils/useOutsideClick";
import { useUploadThing } from "@/utils/uploadthing";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  Camera,
  Image as ImageIcon,
  Settings,
  Trash2,
  UserCheck2,
  UserPlus2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import FollowData from "./FollowData";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const deleteCover = api.user.deleteCover.useMutation();
  const [open, setOpen] = useState<boolean>(false);
  const [follows, setFollow] = useState<boolean>(isFollowing);
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles(acceptedFiles);
  }, []);

  const ref = useOutsideClick(() => {
    if (open) {
      setOpen(false);
    }
  });

  const { startUpload, permittedFileInfo } = useUploadThing("imageUploader", {
    onClientUploadComplete: async (data) => {
      toast.success("Image uploaded!", { id: "uploadToast", duration: 3000 });
      router.refresh();
    },
    onUploadError: () => {
      toast.error("Sorry there was an error", {
        id: "uploadToast",
        duration: 3000,
      });
    },
  });

  const fileTypes = permittedFileInfo?.config
    ? Object.keys(permittedFileInfo?.config)
    : [];

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
    multiple: false,
    noDrag: true,
  });

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

  useEffect(() => {
    if (files.length > 0) {
      if (userData[0]?.coverPhoto) {
        var filekey = userData[0]?.coverPhoto.substring(userData[0]?.coverPhoto.lastIndexOf("/") + 1);
        deleteCover.mutateAsync({
          imageKey: filekey!,
        });
      }

      setOpen(false);
      startUpload(files);
      toast.loading("Uploading image. Do not leave the page", {
        id: "uploadToast",
        duration: Infinity,
      });
    }
  }, [files]);

  return (
    <>
      {userData && (
        <div className="flex w-full flex-1 flex-col">
          <div className="relative -mb-5 flex h-[18rem] w-full items-end justify-end bg-[#EDEDED]">
            {userData[0]?.coverPhoto && (
              <Image
                width={2000}
                height={2000}
                src={userData[0]?.coverPhoto!}
                alt="Cover Photo"
                placeholder="blur"
                className="absolute bottom-0 left-0 top-0 my-auto h-full w-full object-cover object-center"
              />
            )}
            {inProfile && (
              <div className="relative m-5 mb-8 h-fit w-fit ">
                <Button
                  variant="ghost"
                  className="rounded-md bg-white px-5  py-2 font-secondary text-sm font-semibold text-black"
                  onClick={() => {
                    setOpen(true);
                  }}
                >
                  <p className="flex items-center gap-x-2">
                    <Camera
                      className="inline-block"
                      size={21}
                      fill="black"
                      stroke="white"
                    />
                    Edit cover
                  </p>
                </Button>
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 3 }}
                      animate={{ opacity: 100, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      exit={{ opacity: 0, scale: 0.5, y: 3 }}
                      className="font-regular absolute right-0 z-20 h-fit w-44 origin-top translate-y-full overflow-hidden rounded-md border bg-white text-sm shadow-sm"
                      ref={ref}
                    >
                      <button className="relative w-full space-x-2 bg-white p-2 hover:bg-slate-100">
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <div className="flex items-center space-x-2">
                            <ImageIcon className="" size="16" />
                            <p className="">Upload Photo</p>
                          </div>
                        </div>
                      </button>
                      <button className="flex w-full items-center space-x-2 bg-white p-2 hover:bg-slate-100">
                        <Trash2 size={16} />
                        <p className="">Delete photo</p>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          <div className="relative z-10 h-full w-full flex-1 rounded-tl-3xl rounded-tr-3xl border-l border-r border-t border-black/10 bg-white p-5">
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
