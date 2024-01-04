"use client";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { CommentType } from "@/lib/postTypes";
import { SessionUser } from "@/lib/userTypes";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizontal } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import CommentBox from "./CommentBox";

const Comments = ({
  user,
  commentOpen,
  postId,
}: {
  user: SessionUser;
  commentOpen: boolean;
  postId: number;
}) => {

  const utils = api.useUtils();
  const { data } = api.posts.getComments.useInfiniteQuery(
    {
      limit: 5,
      postId,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    },
  );

  const [commentData, setComments] = useState<CommentType[]>(data?.pages[0]?.commentData || []);
  console.log("🚀 ~ file: Comments.tsx:41 ~ commentData:", commentData)


  const commentMutation = api.posts.addComment.useMutation({
    onError(err, _,) {
      const errMessage = err.message;

      if (errMessage === "TOO_MANY_REQUESTS") {
        toast.error("You are doing that too much. Try again later.");
      }

    },
    onSettled: () => {
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
    setComments(data?.pages[0]?.commentData || [])
  }, [data]);

  return (
    <div
      className={cn(
        "max-h-0 overflow-hidden transition-all duration-500 ease-in-out",
        { "max-h-72": commentOpen || commentData.length > 0 },
      )}
    >
      <div className="">
        {commentData.length > 1 && (
          <button className="transition-color ml-5 mt-2 font-primary text-sm font-bold text-primary opacity-70 duration-300 ease-in-out hover:opacity-100">
            View more comments
          </button>
        )}
        {commentData.slice(0, 1).map((data, i) => (
          <CommentBox
            data={data}
            key={i}
            user={user}
            postId={postId}
          />
        ))}
      </div>
      <div className="flex w-full items-start gap-2  px-5 pb-1 pt-3">
        <div className="relative mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full">
          <img
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
