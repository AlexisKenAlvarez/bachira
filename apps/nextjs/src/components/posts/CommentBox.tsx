import { api } from "@/trpc/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import reactStringReplace from "react-string-replace";

import { HoverCard, HoverCardTrigger } from "@/ui/hover-card";
import type { RouterOutputs } from "@bachira/api";
import ProfileCommentCard from "../user/ProfileCommentCard";

const CommentBox = ({
  data,
  user,
  post,
  userFollowing,
}: {
  data: RouterOutputs["posts"]["getComments"]["commentData"][0];
  user: NonNullable<RouterOutputs["user"]["getSession"]>;
  post: RouterOutputs["posts"]["getPosts"]["postData"][0];
  userFollowing: NonNullable<RouterOutputs["user"]["postFollowing"]["userFollowing"]>;
}) => {
  const router = useRouter();

  const deleteMutation = api.posts.deleteComment.useMutation({
    onSuccess: async () => {
      await utils.posts.getComments.invalidate({ postId: post.id });
      router.refresh();
      toast.remove("delete-loading");
      toast.success("Comment deleted.");
    },
    onError: () => {
      toast.remove("delete-loading");
      toast.error("Error deleting comment.");
    },
    onMutate: () => {
      toast.loading("Deleting comment...", {
        id: "delete-loading",
      });
    },
  });
  const utils = api.useUtils();

  return (
    <div className="flex w-full items-start gap-2 px-5 pt-2">
      <div className="relative mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full">
        <HoverCard openDelay={250}>
          <HoverCardTrigger asChild>
            <Link href={`/${data.user.id}`}>
              <Image
                src={data.user.image ?? ""}
                width="500"
                height="500"
                alt={data.user.username ?? ""}
                className="h-full w-full object-cover"
              />
            </Link>
          </HoverCardTrigger>
          <ProfileCommentCard
            data={data}
            user={user}
            userFollowing={
              userFollowing?.some(
                (obj: { following_id: string }) =>
                  obj.following_id === data?.user.id,
              ) ?? false
            }
          />
        </HoverCard>
      </div>
      <div className="w-full rounded-md bg-bg p-2 text-sm">
        <HoverCard openDelay={250}>
          <HoverCardTrigger
            onClick={() => router.push(`/${data.user.username}`)}
            asChild
          >
            <h1 className="w-fit cursor-pointer font-semibold">
              {data.user.username}
            </h1>
          </HoverCardTrigger>
          <ProfileCommentCard
            data={data}
            user={user}
            userFollowing={
              userFollowing?.some(
                (obj: { following_id: string }) =>
                  obj.following_id === data?.user.id,
              ) ?? false
            }
          />
        </HoverCard>

        <pre className="font-primary">
          {reactStringReplace(data.text!, /@\[([^\]]+)\]/g, (match, i) => (
            <Link
              href={`/${match}`}
              color="geekblue"
              className="-mt-[2px] font-primary font-semibold text-primary"
              key={i}
            >
              @{match}
            </Link>
          ))}
        </pre>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="my-auto"
          disabled={deleteMutation.isPending}
        >
          <MoreHorizontal size={18} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="font-primary font-medium">
          <DropdownMenuItem>Report comment</DropdownMenuItem>
          {user.id === data.user.id && (
            <DropdownMenuItem
              className="text-rd/90 focus:text-rd/100"
              onClick={() => {
                deleteMutation.mutate({
                  commentId: data.id,
                });
              }}
            >
              Delete comment
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CommentBox;
