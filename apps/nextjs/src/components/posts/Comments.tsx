"use client";

import type { CommentPrivacyType, PostType } from "@/lib/postTypes";
import type { MentionedType, SessionUser, UserFollowingType } from "@/lib/userTypes";
import type { SuggestionDataItem } from "react-mentions";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn, getToMentionUsers } from "@/lib/utils";
import defaultMentionStyle from "@/styles/commentBoxStyle";
import { api } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizontal } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import { Mention, MentionsInput } from "react-mentions";
import { z } from "zod";

import { Skeleton } from "../ui/skeleton";
import CommentBox from "./CommentBox";
import MentionSuggestion from "./MentionSuggestion";

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
  const [toMention, setToMention] = useState("");
  const [mentioned, setMentioned] = useState<MentionedType[]>([]);
  const [follows, setFollow] = useState(false)

  const router = useRouter();
  const utils = api.useUtils();
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

  const commentMutation = api.posts.addComment.useMutation({
    onError(err, _) {
      const errMessage = err.message;

      if (errMessage === "TOO_MANY_REQUESTS") {
        toast.error("You are doing that too much. Try again later.");
      }
    },
    onSuccess: async () => {
      await utils.posts.getComments.invalidate();
      toast.success("Comment posted!");
      commentForm.reset();
    },
  });

  const mentionQuery = api.user.mentionUser.useQuery({
    username: toMention,
  });

  const commentSchema = z.object({
    comment: z.string().min(1).max(200),
  });

  type commentType = z.infer<typeof commentSchema>;

  const commentForm = useForm<commentType>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      comment: "",
    },
  });

  const commentPrivacyList = [
    {
      id: "FOLLOWERS",
      message:
        user.id === post.userId
          ? "Write a comment..."
          : follows
            ? "Write a comment..."
            : "Only followers can comment on this post.",
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

  const fetchUsers = (
    query: string,
    callback: (data: SuggestionDataItem[]) => void,
  ) => {
    setToMention(query);

    const transformedDataArray = mentionQuery.data?.searchedUsers.map(
      (item) => ({
        display: item.username,
        id: item.id,
        image: item.image ?? "",
      }),
    );

    if (transformedDataArray === undefined) {
      return;
    }

    callback(transformedDataArray);
  };

  const handleAdd = (id: string | number, display: string) => {
    const userData = mentionQuery.data?.searchedUsers.filter(
      (user) => user.username === display,
    );
    console.log(id);
    if (userData) {
      setMentioned((data) => [
        ...data,
        {
          username: userData[0]!.username,
          image: userData[0]!.image ?? "",
          id: userData[0]!.id,
        },
      ]);
    }
  };

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
      {/* Comment Input Area Below */}
      <div className="flex w-full items-start gap-2  px-5 pb-3 pt-3">
        <div className=" mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full ">
          <Image
            width="500"
            height="500"
            src={user.image ?? ""}
            alt={user.username}
            className="h-full w-full object-cover"
          />
        </div>
        <Form {...commentForm}>
          <form
            onSubmit={commentForm.handleSubmit(async (data: commentType) => {
              const { toMention } = getToMentionUsers(data.comment, mentioned);

              await commentMutation.mutateAsync({
                text: data.comment,
                postId: post.id,
                userId: user.id,
                authorId: post.userId,
                username: user.username,
                image: user.image ?? "",
                toMention,
              });
            })}
            className="flex w-full min-w-0 items-center gap-2"
          >
            <FormField
              control={commentForm.control}
              name="comment"
              render={({ field }) => (
                <FormItem className="flex h-auto w-full items-start rounded-md bg-bg">
                  <FormControl className="!h-auto" id="Form control">
                    <MentionsInput
                      singleLine={false}
                      disabled={
                        commentPrivacy === "PUBLIC"
                          ? false
                          : commentPrivacyList.find(
                              (item) => item.id === commentPrivacy,
                            )?.disabled
                      }
                      {...field}
                      placeholder={
                        commentPrivacy === "PUBLIC"
                          ? "Write a comment..."
                          : commentPrivacyList.find(
                              (item) => item.id === commentPrivacy,
                            )?.message
                      }
                      maxLength={200}
                      className="h-full w-full resize-none rounded-md bg-bg px-3 py-2 text-sm outline-0"
                      style={defaultMentionStyle}
                    >
                      <Mention
                        trigger="@"
                        displayTransform={(_, display) => `@${display}`}
                        appendSpaceOnAdd
                        data={fetchUsers}
                        renderSuggestion={MentionSuggestion}
                        className="bg-primary/10"
                        markup="@[__display__]"
                        onAdd={handleAdd}
                      />
                    </MentionsInput>
                  </FormControl>
                  <div className="!mt-3 flex shrink-0 flex-row-reverse items-center gap-2  pr-4">
                    <button
                      className={cn("pointer-events-none  opacity-50", {
                        "pointer-events-auto opacity-100":
                          commentForm.formState.isValid,
                      })}
                      disabled={
                        commentMutation.isPending ??
                        !commentForm.formState.isValid
                      }
                    >
                      <SendHorizontal
                        className=""
                        size={16}
                        fill="#3066b2"
                        stroke="#3066b2"
                      />
                    </button>

                    <p className="text-xs text-subtle">
                      {commentForm.watch("comment").length}/200
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Comments;
