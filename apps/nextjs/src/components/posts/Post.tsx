"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Skeleton } from "@/ui/skeleton";

import { useCallback, useState } from "react";

import { Dialog, DialogContent, DialogTrigger } from "@/ui/dialog";

import PostDialogContent from "./PostDialogContent";
import { RouterOutputs } from "@bachira/api";

const Post = ({ session }: { session: RouterOutputs["user"]["getSession"] }) => {
  const [postOpen, setPostOpen] = useState(false);

  const closeDialog = useCallback(() => {
    setPostOpen(false)
  }, [])

  if (!session) return null;

  return (
    <section className="w-full rounded-md bg-white p-5">
      <div className="flex items-center gap-2">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={session.user_metadata.avatar_url ?? ''}
            className="object-cover"
          />
          <AvatarFallback>
            <Skeleton className="h-full w-full rounded-full" />
          </AvatarFallback>
        </Avatar>
        <Dialog open={postOpen} onOpenChange={setPostOpen}>
          <DialogTrigger className="w-full">
            <input
              type="text"
              placeholder="What's on your mind?"
              className="w-full cursor-text select-none rounded-lg border-none bg-bg px-4 py-3 font-primary outline-none"
            />
          </DialogTrigger>
          <DialogContent>
            <PostDialogContent
              user={{
                userId: session.id,
                username: session.user_metadata.username,
                userImage: session.user_metadata.avatar_url ?? '',
              }}
              closeDialog={closeDialog}
            />
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Post;
