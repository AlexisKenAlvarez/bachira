/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
import { notFound } from "next/navigation";
import { api } from "@/trpc/client";
import { Skeleton } from "@/ui/skeleton";
import { useInView } from "react-intersection-observer";

import PostData from "./PostData";
import type { Session } from "@supabase/supabase-js";

const FeedPosts = ({
  user,
  postId,
}: {
  user: Session["user"];
  postId?: number;
}) => {
  const [ref, inView] = useInView();

  const followingQuery = api.user.postFollowing.useQuery({
    userId: user.id,
  });

  const { data, fetchNextPage, isLoading, isError } =
    api.posts.getPosts.useInfiniteQuery(
      {
        limit: postId ? 1 : 10,
        postId,
        userId: user?.id,
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
        retry: false,
        refetchOnWindowFocus: "always",
      },
    );

  if (isError) {
    notFound();
  }

  useEffect(() => {
    void (() => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      data?.pages.forEach(async (page) => {
        if (page.postData.length === 0 && page.nextCursor !== null) {
          console.log(page.nextCursor);
          await fetchNextPage();
        }
      });
    })();
  }, [data]);

  useEffect(() => {
    void (async () => {
      if (inView === true) {
        await fetchNextPage();
      }
    })();
  }, [inView]);

  return (
    <div className="h-full w-full space-y-4 px-3 lg:px-0">
      {data?.pages.map((page, i) =>
        page.postData.map((post, j) => {
          return (
            <div
              key={post.id}
              ref={
                data?.pages.length - 1 === i && page.postData.length - 1 === j
                  ? ref
                  : undefined
              }
            >
              <PostData
                user={user}
                post={post}
                singlePage={postId ? true : false}
                userFollowing={followingQuery.data?.userFollowing ?? []}
              />
            </div>
          );
        }),
      )}
      {isLoading &&
        [...Array(4)].map((_, i) => (
          <Skeleton className="h-44 w-full bg-slate-200" key={i} />
        ))}
    </div>
  );
};

export default FeedPosts;
