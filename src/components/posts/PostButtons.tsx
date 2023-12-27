"use client";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { motion } from "framer-motion";
import { MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Separator } from "@/components/ui/separator";
import { userData } from "@/lib/routerTypes";
import { UserInterface } from "@/lib/userTypes";

interface postLike {
  postId: number;
  userId: string;
  id: number;
  user: UserInterface;
}

const PostButtons = ({
  postLiked,
  postId,
  userId,
  likes,
}: {
  postLiked: boolean;
  postId: number;
  userId: string;
  likes: postLike[];
}) => {
  const [liked, setLiked] = useState(postLiked);
  const [likeData, setLikeData] = useState<postLike[]>(likes);

  const likeQuery = api.posts.likePost.useMutation({
    onMutate: () => {
      const previousState = liked;
      const previousData = [...likeData];
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
      <div className="px-5 pb-2">
        {likeData.length > 0 ? (
          likeData.length === 1 ? (
            <div className="flex items-center gap-2">
              <div className="text-white bg-gradient-to-br from-primary/50 to-primary rounded-full shrink-0 w-6 h-6 grid place-content-center">
                <ThumbsUp size="12" fill="white" className="" />
              </div>

              {likes.map((like) => (
                <h2 className="text-subtle text-sm">{like.user.username}</h2>
              ))}
            </div>
          ) : null
        ) : null}
      </div>
      <Separator />
      <div className="flex w-full p-1 text-sm">
        <button
          className={cn(
            "flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100",
            { "text-primary": liked },
          )}
          onClick={() =>
            likeQuery.mutate({
              postId,
              userId,
              action: liked ? "UNLIKE" : "LIKE",
            })
          }
        >
          <motion.div
            animate={
              liked ? { scale: [1, 1.15, 1], rotate: [0, 7, -7, 0] } : {}
            }
            className=""
          >
            <ThumbsUp size="16" fill={liked ? "#3066b2" : "transparent"} />
          </motion.div>
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
