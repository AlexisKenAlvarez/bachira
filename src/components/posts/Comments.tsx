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
import { useRouter } from "next/navigation";

const Comments = ({
  user,
  commentOpen,
  comments,
  postId,
}: {
  user: SessionUser;
  commentOpen: boolean;
  comments: CommentType[];
  postId: number;
}) => {
  const [commentData, setComments] = useState<CommentType[]>(comments);
  const utils = api.useUtils()
  const router = useRouter()
  
  const deleteComment = useCallback(async (id: number) => {
    setComments(prevState => prevState.filter(comment => comment.id !== id))
    await utils.posts.getPosts.refetch()
    router.refresh()
    
  }, [commentData])

  const commentQuery = api.posts.addComment.useMutation({
    onMutate: ({ text }) => {
      const previousState = commentData;
      let id = 0;

      if (commentData.length > 0) {
        commentData.map((items, i) => {
          if (i === comments.length - 1) {
            id = items.id + 1;
          }
        });
      }

      const newComment = {
        userId: user.id,
        postId,
        text,
        id,
        user: {
          countId: user.countId,
          id: user.id,
          name: user.name as string,
          coverPhoto: user.coverPhoto,
          username: user.username,
          email: user.email as string,
          image: user.image,
        },
      };

      console.log("New comment ", newComment);

      setComments((prevState) => [...prevState, newComment]);

      return {
        previousState,
      };
    },
    onError(err, _, context) {
      const errMessage = err.message;

      if (errMessage === "TOO_MANY_REQUESTS") {
        toast.error("You are doing that too much. Try again later.");
      }

      setComments(context!.previousState);
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
    console.log(commentData);

  }, [commentData])
  

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
          <CommentBox data={data} key={i} user={user} deleteComment={deleteComment} />
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
              commentQuery.mutateAsync({
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
