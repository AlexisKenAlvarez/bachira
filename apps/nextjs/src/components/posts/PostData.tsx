"use client";

import PostButtons from "@/components/posts/PostButtons";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { privacyData } from "@/lib/constants";
import type { PostType } from "@/lib/postTypes";
import type { SessionUser, UserFollowingType } from "@/lib/userTypes";
import { timeAgo } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import reactStringReplace from "react-string-replace";

import ProfileCardContent from "../user/ProfileCardContent";
import PostActions from "./PostActions";
import PostDialogContent from "./PostDialogContent";

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
  const [
    follows,
    // setFollow
  ] = useState<boolean>(
    userFollowing.some(
      (obj: { following_id: string }) => obj.following_id === post.userId,
    )
  );
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

  // useEffect(() => {
  //   console.log(follows, post?.id);
  // }, [userFollowing])
  

  return (
    <div className="h-fit w-full rounded-md bg-white">
      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent>
          <PostDialogContent
            user={{
              userId: post.userId,
              username: post.user.username!,
              userImage: post.user.image ?? "",
            }}
            closeDialog={closeEdit}
            post={{
              postId: post.id,
              author: post.user.username!,
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
                  <Link href={`/${post.user.username}`}>
                    <Image
                      src={post.user.image ?? ""}
                      width="500"
                      height="500"
                      alt={post.user.username ?? ""}
                      className="absolute left-0 top-0 h-full w-full object-cover"
                    />
                  </Link>
                </HoverCardTrigger>
                <ProfileCardContent
                  post={post}
                  user={user}
                  userFollowing={userFollowing}
                />
              </HoverCard>
            </div>
            <div className="">
              <HoverCard openDelay={250}>
                <HoverCardTrigger>
                  <button onClick={() => router.push(`/${post.user.username}`)}>
                    <h1 className="w-fit cursor-pointer font-semibold">
                      {post.user.username}
                    </h1>
                  </button>
                </HoverCardTrigger>
                <ProfileCardContent
                  post={post}
                  user={user}
                />
              </HoverCard>

              <div className="-mt-[2px] flex gap-x-[5px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      onClick={() =>
                        router.push(`/${post.user.username}/${post.id}`)
                      }
                    >
                      <p className="flex items-center gap-x-2 text-xs opacity-60">
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
              // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
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
        post={post}
        singlePage={singlePage}
        follows={follows}
        userFollowing={userFollowing}
        user={user}
        postLiked={
          post.likes.some((obj) => obj.userId === user.id) ? true : false
        }
      />
    </div>
  );
};

export default PostData;
