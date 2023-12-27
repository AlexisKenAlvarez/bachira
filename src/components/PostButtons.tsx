"use client";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const PostButtons = ({ postLiked, postId, userId }: { postLiked: boolean, postId: number, userId: string }) => {
  const [liked, setLiked] = useState(postLiked);

  const likeQuery = api.posts.likePost.useMutation({
    onMutate: () => {
      const previousState = liked;
      setLiked((curr) => !curr);

      return {
        previousLike: previousState,
      };
    },
    onError(err, _, context) {
      const errMessage = err.message;

      if (errMessage === "TOO_MANY_REQUESTS") {
        toast.error("You are doing that too much. Try again later.");
      }

      setLiked(context!.previousLike);
    },
    onSettled: () => {
      console.log("LIKE ACTION");
    },
  });

  return (
    <div>
      <div className="flex w-full p-1 text-sm">
        <button
          className={cn(
            "flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100",
            { "text-primary": liked },
          )}
          onClick={() => likeQuery.mutate(
            {
              postId,
              userId,
              action: liked ? "UNLIKE" : "LIKE",
            }
          )}
        >
          <ThumbsUp size="16" fill={liked ? "#3066b2" : "transparent"} />
          <p className="">Like</p>
        </button>
        <button className="flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100">
          <MessageCircle size="16" />
          <p className="">Comment</p>
        </button>
        <button className="flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100">
          <Share2 size="16" />
          <p className="">Share</p>
        </button>
      </div>
    </div>
  );
};

export default PostButtons;
