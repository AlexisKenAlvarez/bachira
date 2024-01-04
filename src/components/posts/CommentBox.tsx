import { CommentType } from "@/lib/postTypes";
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

const CommentBox = ({
  data,
  user: userSession,
  postId
}: {
  data: CommentType;
  user: SessionUser;
  postId: number
}) => {
  const { user, text, id } = data;
  const router = useRouter()
  const deleteMutation = api.posts.deleteComment.useMutation({
    onSuccess: () => {
      utils.posts.getComments.invalidate({postId})
      router.refresh()
      toast.remove("delete-loading")
      toast.success("Comment deleted.")
    },
    onError: () => {
      toast.remove("delete-loading")
      toast.error("Error deleting comment.");
    },
    onMutate: () => {
      toast.loading("Deleting comment...", {
        id: "delete-loading"
      })
    }
  });
  const utils = api.useUtils();

  return (
    <div className="flex w-full items-start gap-2 px-5 pt-2">
      <div className="relative mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full">
        <img
          src={user.image as string}
          alt={user.username as string}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="w-full rounded-md bg-bg p-2 text-sm">
        <h1 className="font-semibold">{user.username}</h1>
        <pre className="-mt-[2px] font-primary">{text}</pre>
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
          {userSession.id === user.id && (
            <DropdownMenuItem
              className="text-rd/90 focus:text-rd/100"
              onClick={async () => {
                deleteMutation.mutateAsync({
                  commentId: id,
                })                
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
