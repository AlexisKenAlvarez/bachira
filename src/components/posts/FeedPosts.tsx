"use client";
import PostButtons from "@/components/posts/PostButtons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SessionUser } from "@/lib/userTypes";
import { timeAgo } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "../ui/skeleton";

const FeedPosts = ({
  user,
  postId,
}: {
  user: SessionUser;
  postId?: number;
}) => {
  const [ref, inView] = useInView();
  const router = useRouter();
  const { data, fetchNextPage, isLoading } =
    api.posts.getPosts.useInfiniteQuery(
      {
        limit: postId ? 1 : 10,
        postId,
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
                            <p
                              className="flex items-center gap-x-2 text-xs opacity-60"
                              onClick={() =>
                                router.push(`/${post.user.username}/${post.id}`)
                              }
                            >
                              {timeAgo(post.createdAt.toString())}{" "}
                              <span>
                                {post.privacy === "PUBLIC" ? (
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="opacity-80"
                                  >
                                    <path
                                      d="M10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0ZM14.004 10.878C13.659 10.353 13.41 9.975 12.462 10.125C10.672 10.409 10.473 10.722 10.388 11.238L10.364 11.394L10.339 11.56C10.242 12.243 10.245 12.501 10.559 12.83C11.824 14.158 12.582 15.115 12.812 15.675C12.924 15.948 13.212 16.775 13.014 17.593C14.2278 17.1095 15.3083 16.3425 16.165 15.356C16.275 14.982 16.355 14.516 16.355 13.952V13.847C16.355 12.925 16.355 12.504 15.703 12.131C15.4935 12.0122 15.2782 11.9037 15.058 11.806C14.691 11.639 14.448 11.53 14.12 11.05C14.0804 10.9933 14.0417 10.9359 14.004 10.878ZM10 1.833C7.683 1.833 5.59 2.799 4.104 4.349C4.281 4.472 4.435 4.645 4.541 4.883C4.745 5.34 4.745 5.811 4.745 6.228C4.745 6.556 4.745 6.868 4.85 7.093C4.994 7.401 5.616 7.533 6.165 7.647C6.362 7.689 6.564 7.731 6.748 7.782C7.254 7.922 7.646 8.377 7.959 8.742C8.089 8.893 8.282 9.116 8.379 9.172C8.429 9.136 8.59 8.961 8.669 8.674C8.731 8.454 8.713 8.26 8.624 8.154C8.064 7.494 8.095 6.224 8.268 5.755C8.54 5.016 9.39 5.071 10.012 5.111C10.244 5.126 10.462 5.141 10.626 5.12C11.248 5.042 11.44 4.095 11.575 3.91C11.867 3.51 12.761 2.907 13.315 2.535C12.2715 2.07099 11.142 1.83181 10 1.833Z"
                                      fill="black"
                                    />
                                  </svg>
                                ) : (
                                  <Users size={13} strokeWidth={2.5} />
                                )}
                              </span>
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
                author={post.user.username as string}
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
