"use client";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/client";
import { Dialog, DialogContent, DialogTrigger } from "@/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Separator } from "@/ui/separator";
import { motion } from "framer-motion";
import { Link, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

import type { RouterOutputs } from "@bachira/api";
import Comments from "./Comments";
import LikeDialog from "./LikeDialog";

interface postLike {
  postId: number,
  user: {
    username: string,
    id: string
  } | null
}

const PostButtons = ({
  postLiked,
  user,
  post,
  singlePage,
  userFollowing,
}: {
  postLiked: boolean;
  post: RouterOutputs["posts"]["getPosts"]["postData"][0];
  user:  NonNullable<RouterOutputs["user"]["getSession"]>;
  singlePage: boolean;
  userFollowing: NonNullable<RouterOutputs["user"]["postFollowing"]["userFollowing"]>;
}) => {
  const [liked, setLiked] = useState(postLiked);
  const [likeData, setLikeData] = useState<postLike[]>(post.likes)
  const [commentOpen, setCommentOpen] = useState(false);
  const [likeOpen, setLikeOpen] = useState(false);
  const utils = api.useUtils();

  const closeLikeDialog = useCallback(() => {
    setLikeOpen(false);
  }, []);

  const likeMutation = api.posts.likePost.useMutation({
    onMutate: () => {
      const previousLikeData = likeData;

      if (!liked) {
        const newLike: postLike = {
          postId: post.id,
          user: {
            id: user.id,
            username: user.user_metadata.username as string,
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
          prevState.filter((like) => like.user?.id !== user.id),
        );
      }

      setLiked((curr) => !curr);

      return {
        previousLikeData,
      };
    },
    onError(err, _, context) {
      const errMessage = err.message;

      if (errMessage === "TOO_MANY_REQUESTS") {
        toast.error("You are doing that too much. Try again later.");
      }

      setLiked(!liked);
      setLikeData(context!.previousLikeData);
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
                        {like.user?.username}
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
                postId={post.id}
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
          onClick={async () => {
            await utils.notifications.countNotifications.invalidate();
            likeMutation.mutate({
              postId: post.id,
              userId: user.id,
              authorId: post.author.id,
              action: liked ? "UNLIKE" : "LIKE",
              username: user.user_metadata.username as string,
              image: user.user_metadata.avatar_url as string ?? "",
            });
          }}
        >
          <motion.div
            animate={
              liked ? { scale: [1, 1.15, 1], rotate: [0, 7, -7, 0] } : {}
            }
            className=""
          >
            <ThumbsUp size="16" fill={liked ? "#3066b2" : "transparent"} />
          </motion.div>
          <p className="text-xs sm:text-sm lg:text-base">Like</p>
        </button>
        <button
          className="flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100"
          onClick={() => {
            setCommentOpen(true);
          }}
        >
          <MessageCircle size="16" />
          <p className="text-xs sm:text-sm lg:text-base">Comment</p>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100">
              <Share2 size="16" />
              <p className="text-xs sm:text-sm lg:text-base">Share</p>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" alignOffset={20}>
            <DropdownMenuItem className="flex items-center gap-x-2 font-semibold">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    `${process.env.NEXT_PUBLIC_BASE_URL}${post.author.username}/${post.author.id}`,
                  );
                }}
                className="flex items-center gap-x-2"
              >
                <Link size={15} /> <p className="">Copy link</p>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      <Comments
        userFollowing={userFollowing}
        user={user}
        commentOpen={commentOpen}
        singlePage={singlePage}
        commentPrivacy={post.comment_privacy}
        post={post}
      />
    </div>
  );
};

export default PostButtons;
