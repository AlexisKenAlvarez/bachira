"use client";

import { Separator } from "@/components/ui/separator";
import { DatabaseUser, SessionUser } from "@/lib/userTypes";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { motion } from "framer-motion";
import { MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Comments from "./Comments";
import { CommentType } from "@/lib/postTypes";

interface postLike {
  postId: number;
  userId: string;
  user: DatabaseUser;
}

const PostButtons = ({
  postLiked,
  postId,
  userId,
  user,
  likes,
  comments
}: {
  postLiked: boolean;
  postId: number;
  userId: string;
  user: SessionUser;
  likes: postLike[];
  comments: CommentType[]
}) => {
  console.log("🚀 ~ file: PostButtons.tsx:35 ~ likes:", likes)
  const [liked, setLiked] = useState(postLiked);
  const [likeData, setLikeData] = useState<postLike[]>(likes);
  const [commentOpen, setCommentOpen] = useState(false)

  const likeQuery = api.posts.likePost.useMutation({
    onMutate: () => {
      const previousState = liked;

      if (!liked) {

        const newLike: postLike = {
          postId,
          userId,
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

        console.log(newLike);

        setLikeData((prevState) => [
          ...prevState,
          {
            ...newLike,
          },
        ]);
      } else {
        setLikeData((prevState) =>
          prevState.filter(
            (like) => like.userId !== userId
          ),
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
      <div className="px-5 pb-2">
        {likeData.length > 0 ? (
          likeData.length === 1 ? (
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

              <h2 className="text-sm text-subtle">
                 {likeData.length} 
                </h2>
            </div>
          )
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
        <button className="flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100" onClick={() => {setCommentOpen(true)}}>
          <MessageCircle size="16" />
          <p className="">Comment</p> 
        </button>
        <button className="flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100">
          <Share2 size="16" />
          <p className="">Share</p>
        </button>
      </div>
      <Separator/>
      <Comments user={user} commentOpen={commentOpen} comments={comments} postId={postId} /> 
    </div>
  );
};

export default PostButtons;
