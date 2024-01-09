"use client";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { SessionUser } from "@/lib/userTypes";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { Skeleton } from "../ui/skeleton";
import CommentBox from "./CommentBox";
import Image from "next/image";

const Comments = ({
  user,
  commentOpen,
  postId,
  author,
  singlePage,
}: {
  user: SessionUser;
  commentOpen: boolean;
  postId: number;
  author: string;
  singlePage: boolean;
}) => {
  const router = useRouter();
  const utils = api.useUtils();
  const [ref, inView, entry] = useInView({ trackVisibility: true, delay: 100 });

  const { data, fetchNextPage, isLoading } =
    api.posts.getComments.useInfiniteQuery(
      {
        limit: 5,
        postId,
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
    onSuccess: () => {
      utils.posts.getComments.invalidate();
      toast.success("Comment posted!");
      commentForm.reset();
    },
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
  useEffect(() => {
    console.log(inView);
    if (inView || entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [inView, entry]);

  return (
    <div
      className={cn(
        "relative z-10 max-h-0 overflow-hidden transition-all duration-500 ease-in-out",
        {
          "max-h-72":
            commentOpen || data?.pages[0]?.commentData.length || -1 > 0,
        },
        { "max-h-full": singlePage },
      )}
    >
      <div>
        {data?.pages[0]?.commentData &&
          data?.pages[0]?.commentData.length > 1 &&
          !singlePage && (
            <button
              className="transition-color ml-5 mt-2 font-primary text-sm font-bold text-primary opacity-70 duration-300 ease-in-out hover:opacity-100"
              onClick={() => {
                if (singlePage) {
                  fetchNextPage();
                } else {
                  router.push(`/${author}/${postId}`);
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
                      postId={postId}
                    />
                  </div>
                )),
              )}

              {isLoading &&
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
                <CommentBox data={commentData} user={user} postId={postId} />
              </div>
            ))
          )}
        </div>
      </div>
      {/* Comment Input Area Below */}
      <div className="flex w-full items-start gap-2  px-5 pb-1 pt-3">
        <div className="relative mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full">
          <Image
            width="500"
            height="500"
            src={user.image as string}
            alt={user.username}
            className="h-full w-full object-cover"
          />
        </div>
        <Form {...commentForm}>
          <form
            onSubmit={commentForm.handleSubmit(async (data: commentType) =>
              commentMutation.mutateAsync({
                text: data.comment,
                postId,
                userId: user.id,
              }),
            )}
            className="flex w-full items-center gap-2"
          >
            <FormField
              control={commentForm.control}
              name="comment"
              render={({ field }) => (
                <FormItem className="relative w-full">
                  <FormControl>
                    <TextareaAutosize
                      {...field}
                      placeholder="Write a comment..."
                      maxLength={200}
                      className="h-full w-full resize-none rounded-md bg-bg px-3 py-2 pr-28 text-sm outline-0"
                    />
                  </FormControl>
                  <button
                    className={cn(
                      "pointer-events-none  absolute right-4 top-[2px] opacity-50",
                      {
                        "pointer-events-auto opacity-100":
                          commentForm.formState.isValid,
                      },
                    )}
                    disabled={
                      commentMutation.isLoading ||
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

                  <p className="absolute  right-10 top-[2px] text-xs text-subtle">
                    {commentForm.watch("comment").length}/200
                  </p>
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
