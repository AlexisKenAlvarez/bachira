"use client";
import {
  Bookmark,
  FlagTriangleRight,
  Loader,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Button } from "../ui/button";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";

const PostActions = ({
  author,
  userId,
  postId,
}: {
  author: string;
  userId: string;
  postId: number;
}) => {
  const [deleteAlert, setDeleteAlert] = useState(false);
  const deleteMutation = api.posts.deletePost.useMutation({
    onSuccess: () => {
      console.log("Delete success");
      setDeleteAlert(false);
      toast.success("Post deleted.")
    }
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="mb-auto">
          <MoreHorizontal size={18} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="font-medium ">
          <DropdownMenuItem className="items-start gap-3 pr-5 text-left">
            <Bookmark className="mt-1" size={23} />
            <div className="">
              <h2 className="text-sm md:text-base">Save post</h2>
              <p className="text-sm font-light text-subtle">
                Add this post to your saved items.
              </p>
            </div>
          </DropdownMenuItem>

          {author === userId && (
            <>
              {/* Author only actions */}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="items-start gap-3 pr-5 text-left text-base">
                <Pencil className="mt-1" size={23} />
                <h2 className="text-sm md:text-base">
                  Who can comment on this post?
                </h2>
              </DropdownMenuItem>
              <DropdownMenuItem className="items-start gap-3 pr-5 text-left text-base">
                <MessageCircle className="mt-1" size={23} />
                <h2 className="text-sm md:text-base">Edit post</h2>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="group items-start gap-3 pr-5 text-left"
                onClick={() => {
                  setDeleteAlert(true);
                }}
              >
                <Trash
                  className="mt-1 transition-colors duration-100 ease-in-out group-hover:text-rd"
                  size={23}
                />
                <div className="">
                  <h2 className="text-sm transition-colors duration-100 ease-in-out group-hover:text-rd md:text-base">
                    Delete post
                  </h2>
                  <p className="text-sm font-light text-subtle">
                    Delete this post permanently
                  </p>
                </div>
              </DropdownMenuItem>
            </>
          )}

          {/* Other actions */}
          {author !== userId && (
            <DropdownMenuItem className="group items-start gap-3 pr-5 text-left">
              <FlagTriangleRight
                className="mt-1 transition-colors duration-100 ease-in-out group-hover:text-rd"
                size={23}
              />
              <div className="">
                <h2 className="text-sm transition-colors duration-100 ease-in-out group-hover:text-rd md:text-base">
                  Report post
                </h2>
                <p className="max-w-[13rem] text-sm font-light text-subtle md:max-w-full">
                  Report this post for violating our community
                </p>
              </div>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteAlert} onOpenChange={setDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this post?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              post across all pages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <Button
              variant="destructive"
              onClick={() => {
               deleteMutation.mutate({ postId })
              }}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? (
                <div className="space-x-2 flex">
                <Loader className="animate-spin" size={18} />
                <p className="">Deleting</p>
              </div>
              ) : (
                <div className="space-x-2 flex">
                  <Trash size={18} />
                  <p className="">Continue</p>
                </div>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PostActions;
