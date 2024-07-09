"use client";

import PostButtons from "@/components/posts/PostButtons";
import { privacyData } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { Dialog, DialogContent } from "@/ui/dialog";
import { HoverCard, HoverCardTrigger } from "@/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/ui/tooltip";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import reactStringReplace from "react-string-replace";

import type { RouterOutputs } from "@bachira/api";

import ProfileCardContent from "../user/ProfileCardContent";
import PostActions from "./PostActions";
import PostDialogContent from "./PostDialogContent";
import type { Session } from "@supabase/supabase-js";

const PostData = ({
  user,
  post,
  singlePage,
  userFollowing,
}: {
  user: Session["user"];
  post: RouterOutputs["posts"]["getPosts"]["postData"][0];
  singlePage: boolean;
  userFollowing: NonNullable<RouterOutputs["user"]["postFollowing"]["userFollowing"]>;
}) => {
  const [postOpen, setPostOpen] = useState(false);
  const router = useRouter();

  const options = {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  } as const;

  const closeEdit = useCallback(() => {
    setPostOpen(false);
  }, []);

  const openEdit = useCallback(() => {
    setPostOpen(true);
  }, []);

  const date = new Date(post.createdAt);

  return (
    <div className="h-fit w-full rounded-md bg-white">
      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent>
          <PostDialogContent
            user={{
              userId: post.author.id,
              username: post.author.username,
              userImage: post.author.image ?? "",
            }}
            closeDialog={closeEdit}
            post={{
              postId: post.id,
              author: post.author.username,
              postText: post.text,
              privacy: (post.privacy as "PUBLIC") ? "FOLLOWERS" : "PRIVATE",
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
                  <Link href={`/${post.author.username}`}>
                    <Image
                      src={post.author.image ?? ""}
                      width="500"
                      height="500"
                      alt={post.author.username ?? ""}
                      className="absolute left-0 top-0 h-full w-full object-cover"
                    />
                  </Link>
                </HoverCardTrigger>
                <ProfileCardContent
                  post={post}
                  user={user}
                  userFollowing={
                    userFollowing?.some(
                      (obj: { following_id: string }) =>
                        obj.following_id === post.author.id,
                    ) ?? false
                  }
                />
              </HoverCard>
            </div>
            <div className="">
              <HoverCard openDelay={250}>
                <HoverCardTrigger>
                  <button onClick={() => router.push(`/${post.author.username}`)}>
                    <h1 className="w-fit cursor-pointer font-semibold">
                      {post.author.username}
                    </h1>
                  </button>
                </HoverCardTrigger>
                <ProfileCardContent
                  post={post}
                  user={user}
                  userFollowing={
                    userFollowing?.some(
                      (obj: { following_id: string }) =>
                        obj.following_id === post.author.id,
                    ) ?? false
                  }
                />
              </HoverCard>

              <div className="-mt-[2px] flex gap-x-[5px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      onClick={() =>
                        router.push(`/${post.author.username}/${post.id}`)
                      }
                    >
                      <p className="flex items-center gap-x-2 text-xs opacity-60">
                        {timeAgo(post.createdAt.toString())}{" "}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className="">
                      <p className="text-xs text-subtle">
                        {date.toLocaleString("en-US", options)}{" "}
                        {date.toLocaleTimeString("en-US", {
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
            author={post.author.id}
            userId={user.id}
            postId={post.id}
            openEdit={openEdit}
            commentPrivacy={
              post.comment_privacy as "PUBLIC" | "FOLLOWERS" | "PRIVATE"
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
        post={post}
        singlePage={singlePage}
        userFollowing={userFollowing}
        user={user}
        postLiked={
          post.likes.some((obj) => obj.user?.id === user.id) ? true : false
        }
      />
    </div>
  );
};

export default PostData;
