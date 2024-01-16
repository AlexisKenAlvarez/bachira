"use client";

import type { CommentPrivacyType, PostType } from "@/lib/postTypes";
import type { SessionUser, UserFollowingType } from "@/lib/userTypes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/client";
import { useInView } from "react-intersection-observer";

import { Skeleton } from "../ui/skeleton";
import CommentBox from "./CommentBox";
import CommentInput from "./CommentInput";

const Comments = ({
  user,
  commentOpen,
  singlePage,
  commentPrivacy,
  post,
  userFollowing,
}: {
  user: SessionUser;
  commentOpen: boolean;
  singlePage: boolean;
  commentPrivacy: CommentPrivacyType;
  post: PostType;
  userFollowing: UserFollowingType;
}) => {
  const [follows, setFollow] = useState(false);

  const router = useRouter();
  const [ref, inView, entry] = useInView({ trackVisibility: true, delay: 100 });

  const { data, fetchNextPage, isPending } =
    api.posts.getComments.useInfiniteQuery(
      {
        limit: 5,
        postId: post.id,
        singlePage,
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
      },
    );

  const commentPrivacyList = [
    {
      id: "FOLLOWERS",
      message:
        user.id === post.userId
          ? "Write a comment..."
          : follows
            ? "Write a comment..."
            : "Only users following the author can comment on this post.",
      disabled: user.id === post.userId ? false : follows ? false : true,
    },
    {
      id: "PRIVATE",
      message:
        user.id === post.userId
          ? "Write a comment..."
          : "Only the author can comment on this post.",
      disabled: user.id === post.userId ? false : follows ? true : true,
    },
  ];

  useEffect(() => {
    void (async () => {
      if (inView || entry?.isIntersecting) {
        await fetchNextPage();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, entry]);

  useEffect(() => {
    setFollow(
      userFollowing?.some(
        (obj: { following_id: string }) => obj.following_id === post?.userId,
      ) ?? false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userFollowing, follows]);

  return (
    <div
      className={cn(
        " z-10 max-h-0 overflow-hidden opacity-0 transition-all duration-500 ease-in-out",
        {
          "max-h-72 overflow-visible opacity-100":
            commentOpen || (data?.pages[0]?.commentData.length ?? -1 > 0),
        },
        { "max-h-full overflow-visible opacity-100": singlePage },
      )}
    >
      <div>
        {data?.pages[0]?.commentData &&
          data?.pages[0]?.commentData.length > 1 &&
          !singlePage && (
            <button
              className="transition-color ml-5 mt-2 font-primary text-sm font-bold text-primary opacity-70 duration-300 ease-in-out hover:opacity-100"
              onClick={async () => {
                if (singlePage) {
                  await fetchNextPage();
                } else {
                  router.push(`/${post.user.username}/${post.id}`);
                }
              }}
            >
              View more comments
            </button>
          )}

        <div className="w-full">
          {singlePage ? (
            <>
              {data?.pages.map((page, i) =>
                page.commentData.map((commentData, j) => (
                  <div
                    key={commentData.id}
                    ref={
                      data?.pages.length - 1 === i &&
                      page.commentData.length - 1 === j
                        ? ref
                        : undefined
                    }
                  >
                    <CommentBox
                      data={commentData}
                      user={user}
                      post={post}
                      userFollowing={userFollowing}
                    />
                  </div>
                )),
              )}

              {isPending &&
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                [...new Array(5)].map((_, i) => (
                  <div
                    className="flex w-full items-start gap-2 px-5 pr-11 pt-2"
                    key={i}
                  >
                    <Skeleton className="relative mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full" />
                    <Skeleton className="h-12 w-full rounded-md bg-bg p-2 text-sm" />
                  </div>
                ))}
            </>
          ) : (
            data?.pages[0]?.commentData.slice(0, 1).map((commentData) => (
              <div key={commentData.id}>
                <CommentBox
                  data={commentData}
                  user={user}
                  post={post}
                  userFollowing={userFollowing}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {commentPrivacy === "PUBLIC" ? (
        <CommentInput user={user} post={post} userFollowing={userFollowing} />
      ) : commentPrivacyList.find((item) => item.id === commentPrivacy)
          ?.disabled === false ? (
        <CommentInput user={user} post={post} userFollowing={userFollowing} />
      ) : (
        <p className="text-subtle text-center text-sm p-5">
          {
            commentPrivacyList.find((item) => item.id === commentPrivacy)
              ?.message
          }
        </p>
      )}
    </div>
  );
};

export default Comments;
