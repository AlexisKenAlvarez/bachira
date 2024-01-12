"use client";
import PostButtons from "@/components/posts/PostButtons";
import { privacyData } from "@/lib/constants";
import { SessionUser } from "@/lib/userTypes";
import { timeAgo } from "@/lib/utils";
import { api } from "@/trpc/react";
import { RouterOutputs } from "@/trpc/shared";
import { Settings, UserCheck2, UserPlus2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import reactStringReplace from "react-string-replace";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import Link from "next/link";
import React from "react";
import PostActions from "./PostActions";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Dialog, DialogContent } from "@/components/ui/dialog";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import PostDialogContent from "./PostDialogContent";
import { CommentPrivacyType } from "@/lib/postTypes";

type PostType = RouterOutputs["posts"]["getPosts"]["postData"][0];
type UserFollowingType = RouterOutputs["posts"]["getPosts"]["userFollowing"];

const PostData = ({
  user,
  post,
  singlePage,
  userFollowing,
}: {
  user: SessionUser;
  post: PostType;
  singlePage: boolean;
  userFollowing: UserFollowingType;
}) => {
  const [postOpen, setPostOpen] = useState(false);
  const [follows, setFollow] = useState<boolean>(
    userFollowing.some((obj) => obj.following_id === post.userId),
  );
  const router = useRouter();

  const followUser = api.user.followUser.useMutation({
    onMutate: () => {
      const previousState = follows;

      setFollow(true);

      return {
        previousLike: previousState,
      };
    },
    onError(err, _, context) {
      const errMessage = err.message;

      if (errMessage === "TOO_MANY_REQUESTS") {
        toast.error("You are doing that too much. Try again later.");
      }

      setFollow(context!.previousLike);
    },
    onSettled: () => {
      console.log("LIKE ACTION");
    },
  });

  const unfollow = api.user.followUser.useMutation({
    onMutate: () => {
      const previousState = follows;

      setFollow(false);

      return {
        previousLike: previousState,
      };
    },
    onError: (err, variables, context) => {
      const errMessage = err.message;

      if (errMessage === "TOO_MANY_REQUESTS") {
        toast.error("You are doing that too much. Try again later.");
      }

      setFollow(context!.previousLike);
    },
    onSettled: () => {
      console.log("DISLIKE ACTION");
    },
  });



  const handleFollow = async () => {
    try {
      if (follows) {
        // Unfollow user
        await unfollow.mutateAsync({
          followerId: user.id,
          followingId: post.userId,
          action: "unfollow",
        });
      } else {
        // Follow user
        await followUser.mutateAsync({
          followerName: user.username,
          followerId: user.id,
          followingId: post.userId,
          action: "follow",
          image: user.image!,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const options = {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  } as const;

  const HoverContent = (
    <HoverCardContent
      side="bottom"
      align="center"
      sideOffset={20}
      className=" w-fit space-y-3 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <Image
            width={600}
            height={600}
            alt={post.user.username as string}
            src={post.user.image as string}
            className="w-11 rounded-full"
          />
        </div>
        <div className="">
          <div className="flex h-auto w-full justify-between font-primary">
            <div className="">
              <h2 className=" commit w-62 truncate text-base font-bold">
                @{post.user.username as string}
              </h2>
              <h3 className="text-sm font-medium">
                {post.user.name as string}
              </h3>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-x-2">
        {post.userId === user.id ? (
          <Button
            className="group w-full gap-x-2 px-6 text-sm font-semibold"
            disabled={!user}
            variant="secondary"
            onClick={() => router.push("/profile/edit")}
          >
            <Settings
              size={18}
              className="duration-500 ease-in-out group-hover:rotate-180"
            />
            Edit Profile
          </Button>
        ) : (
          <Button
            className="w-full px-7"
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
    </HoverCardContent>
  );

  const closeEdit = useCallback(() => {
    setPostOpen(false);
  }, []);

  const openEdit = useCallback(() => {
    setPostOpen(true);
  }, []);

  return (
    <div className="h-fit w-full rounded-md bg-white">
      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent>
          <PostDialogContent
            user={{
              userId: post.userId,
              username: post.user.username as string,
              userImage: post.user.image as string,
            }}
            closeDialog={closeEdit}
            post={{
              postId: post.id,
              author: post.user.username as string,
              postText: post.text,
              privacy: post.privacy as "PUBLIC" | "FOLLOWERS" | "PRIVATE",
            }}
          />
        </DialogContent>
      </Dialog>
      <div className="p-5 pb-3">
        <div className="flex justify-between">
          <div className="flex gap-x-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              <HoverCard openDelay={250}>
                <HoverCardTrigger asChild>
                  <Link href={`/${post.user.username}`}>
                    <Image
                      src={post.user.image as string}
                      width="500"
                      height="500"
                      alt={post.user.username as string}
                      className="absolute left-0 top-0 h-full w-full object-cover"
                    />
                  </Link>
                </HoverCardTrigger>
                {HoverContent}
              </HoverCard>
            </div>
            <div className="">
              <HoverCard openDelay={250}>
                <HoverCardTrigger>
                  <button>
                    <h1
                      className="w-fit cursor-pointer font-semibold"
                      onClick={() => router.push(`/${post.user.username}`)}
                    >
                      {post.user.username}
                    </h1>
                  </button>
                </HoverCardTrigger>
                {HoverContent}
              </HoverCard>

              <div className="-mt-[2px] flex gap-x-[5px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <p
                        className="flex items-center gap-x-2 text-xs opacity-60"
                        onClick={() =>
                          router.push(`/${post.user.username}/${post.id}`)
                        }
                      >
                        {timeAgo(post.createdAt.toString())}{" "}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className="">
                      <p className="text-xs text-subtle">
                        {post.createdAt.toLocaleString("en-US", options)}{" "}
                        {post.createdAt.toLocaleTimeString("en-US", {
                          hour12: true,
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="cursor-default opacity-70">
                      {privacyData.map((data) => (
                        <React.Fragment key={data.value}>
                          {data.value === post.privacy && data.icon}
                        </React.Fragment>
                      ))}
                    </TooltipTrigger>
                    <TooltipContent className="">
                      <p className="text-xs text-subtle">
                        {privacyData.map((data) => (
                          <React.Fragment key={data.value}>
                            {data.value === post.privacy && data.description}
                          </React.Fragment>
                        ))}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <PostActions
            author={post.userId}
            userId={user.id}
            postId={post.id}
            openEdit={openEdit}
            commentPrivacy={
              post.commentPrivacy as "PUBLIC" | "FOLLOWERS" | "PRIVATE"
            }
          />
        </div>
        <div className="mt-2">
          <pre className="font-primary">
            {reactStringReplace(post.text, /@\[([^\]]+)\]/g, (match, i) => (
              <Link
                href={`/${match}`}
                color="geekblue"
                className="font-medium text-primary"
                key={i}
              >
                @{match}
              </Link>
            ))}
          </pre>
        </div>
      </div>

      <PostButtons
        post={{
          authorId: post.userId,
          author: post.user.username as string,
          likes: post.likes,
          postId: post.id,
          privacy: post.privacy,
          commentPrivacy: post.commentPrivacy as CommentPrivacyType
        }}
        singlePage={singlePage}
        follows={follows}
        user={user}
        userId={user.id}
        postLiked={
          post.likes.some((obj) => obj.userId === user.id) ? true : false
        }
      />
    </div>
  );
};

export default PostData;
