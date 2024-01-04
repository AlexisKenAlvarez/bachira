"use client";
import PostButtons from "@/components/posts/PostButtons";
import { SessionUser } from "@/lib/userTypes";
import { timeAgo } from "@/lib/utils";
import { api } from "@/trpc/react";
import Image from "next/image";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "../ui/skeleton";

const FeedPosts = ({ user }: { user: SessionUser }) => {
  const [ref, inView] = useInView();

  const { data, fetchNextPage, isLoading } =
    api.posts.getPosts.useInfiniteQuery(
      {
        limit: 10,
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
      },
    );

  const options = {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  } as const;

  useEffect(() => {
    if (inView === true) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <div className="h-full w-full space-y-4 px-3 lg:px-0">
      {isLoading &&
        [...Array(4)].map((_, i) => (
          <Skeleton className="h-44 w-full bg-slate-200" key={i} />
        ))}
      {data?.pages.map((page, i) =>
        page.postData.map((post, j) => {
          return (
            <div
              className="h-fit w-full rounded-md bg-white"
              key={post.id}
              ref={
                data?.pages.length - 1 === i && page.postData.length - 1 === j
                  ? ref
                  : undefined
              }
            >
              <div className="p-5 pb-3">
                <div className="flex gap-x-2">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={post.user.image as string}
                      width="500"
                      height="500"
                      alt={post.user.username as string}
                      className="absolute left-0 top-0 h-full w-full object-cover"
                    />
                  </div>
                  <div className="">
                    <h1 className="font-semibold">{post.user.username}</h1>
                    <div className="-mt-[6px]">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {" "}
                            <p className="text-xs opacity-60">
                              {timeAgo(post.createdAt.toString())}
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
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="">{post.text}</p>
                </div>
              </div>

              <PostButtons
                authorId={post.userId}
                user={user}
                likes={post.likes}
                postId={post.id}
                userId={user.id}
                postLiked={
                  post.likes.some((obj) => obj.userId === user.id)
                    ? true
                    : false
                }
              />
            </div>
          );
        }),
      )}
    </div>
  );
};

export default FeedPosts;
