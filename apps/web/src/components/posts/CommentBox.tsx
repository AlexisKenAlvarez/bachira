import { CommentType, PostType } from "@/lib/postTypes";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SessionUser } from "@/lib/userTypes";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { HoverCard, HoverCardTrigger } from "../ui/hover-card";
import ProfileCardContent from "../user/ProfileCardContent";
import reactStringReplace from "react-string-replace";


const CommentBox = ({
  data,
  user,
  post,
  follows,
}: {
  data: CommentType;
  user: SessionUser;
  post: PostType;
  follows: boolean;
}) => {
  const router = useRouter();
  const deleteMutation = api.posts.deleteComment.useMutation({
    onSuccess: () => {
      utils.posts.getComments.invalidate({ postId: post.id });
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
            <Link href={`/${post.user.username}`}>
              <Image
                src={post.user.image as string}
                width="500"
                height="500"
                alt={post.user.username as string}
                className="h-full w-full object-cover"
              />
            </Link>
          </HoverCardTrigger>
          <ProfileCardContent
            isFollowing={follows}
            post={post}
            user={user}
          />
        </HoverCard>
      </div>
      <div className="w-full rounded-md bg-bg p-2 text-sm">
        <HoverCard openDelay={250}>
          <HoverCardTrigger asChild>
            <h1 className="w-fit font-semibold cursor-pointer" onClick={() => router.push(`/${data.user.username}`)}>{data.user.username}</h1>
          </HoverCardTrigger>
          <ProfileCardContent
            isFollowing={follows}
            post={post}
            user={user}
          />
        </HoverCard>

        <pre className="font-primary">
            {reactStringReplace(data.text, /@\[([^\]]+)\]/g, (match, i) => (
              <Link
                href={`/${match}`}
                color="geekblue"
                className="-mt-[2px] font-primary text-primary font-medium"
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
          disabled={deleteMutation.isLoading}
        >
          <MoreHorizontal size={18} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="font-medium">
          <DropdownMenuItem>Report comment</DropdownMenuItem>
          {user.id === data.userId && (
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
