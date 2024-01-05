"use client";

import { Separator } from "@/components/ui/separator";
import { DatabaseUser, SessionUser } from "@/lib/userTypes";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { motion } from "framer-motion";
import { MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import Comments from "./Comments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LikeDialog from "./LikeDialog";

interface postLike {
  postId: number;
  userId: string;
  user: DatabaseUser;
}

const PostButtons = ({
  postLiked,
  postId,
  userId,
  authorId,
  user,
  likes,
}: {
  postLiked: boolean;
  postId: number;
  userId: string;
  authorId: string;
  user: SessionUser;
  likes: postLike[];
}) => {
  const [liked, setLiked] = useState(postLiked);
  const [likeData, setLikeData] = useState<postLike[]>(likes);
  const [commentOpen, setCommentOpen] = useState(false);
  const [likeOpen, setLikeOpen] = useState(false);

  const closeLikeDialog = useCallback(() => {
    setLikeOpen(false);
  }, [likeOpen]);

  const likeMutation = api.posts.likePost.useMutation({
    onMutate: () => {
      const previousState = liked;

      if (!liked) {
        const newLike: postLike = {
          postId,
          userId,
          user: {
            username: user.username,
          },
        };

        console.log(newLike);

        setLikeData((prevState) => [
          ...prevState,
          {
            ...newLike,
          },
        ]);
      } else {
        setLikeData((prevState) =>
          prevState.filter((like) => like.userId !== userId),
        );
      }

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
      {likeData.length > 0 ? (
        <div className="px-5 pb-2">
          <Dialog open={likeOpen} onOpenChange={setLikeOpen}>
            <DialogTrigger>
              <>
                {likeData.length === 1 ? (
                <div className="flex items-center gap-2">
                  <div className="grid h-6 w-6 shrink-0 place-content-center rounded-full bg-gradient-to-br from-primary/50 to-primary text-white">
                    <ThumbsUp size="12" fill="white" className="" />
                  </div>

                  {likeData.map((like, i) => (
                    <h2 className="text-sm text-subtle" key={i}>
                      {like.user.username}
                    </h2>
                  ))}
                </div>
                ) : (
                <div className="flex items-center gap-2">
                  <div className="grid h-6 w-6 shrink-0 place-content-center rounded-full bg-gradient-to-br from-primary/50 to-primary text-white">
                    <ThumbsUp size="12" fill="white" className="" />
                  </div>

                  <h2 className="text-sm text-subtle">{likeData.length}</h2>
                </div>
                )}
              </>
            </DialogTrigger>
            <DialogContent className="px-2 pr-4 pt-2">
              <LikeDialog
                postId={postId}
                likeLength={likeData.length}
                closeDialog={closeLikeDialog}
              />
            </DialogContent>
          </Dialog>
        </div>
      ) : null}
      <Separator />
      <div className="flex w-full p-1 text-sm">
        <button
          className={cn(
            "flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100",
            { "text-primary": liked },
          )}
          onClick={() =>
            likeMutation.mutate({
              postId,
              userId,
              authorId,
              action: liked ? "UNLIKE" : "LIKE",
              username: user.username,
              image: user.image as string,
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
        <button
          className="flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100"
          onClick={() => {
            setCommentOpen(true);
          }}
        >
          <MessageCircle size="16" />
          <p className="">Comment</p>
        </button>
        <button className="flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100">
          <Share2 size="16" />
          <p className="">Share</p>
        </button>
      </div>
      <Separator />
      <Comments user={user} commentOpen={commentOpen} postId={postId} />
    </div>
  );
};

export default PostButtons;
