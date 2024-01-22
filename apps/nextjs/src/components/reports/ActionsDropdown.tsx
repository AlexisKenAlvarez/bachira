import { useState } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/client";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Label } from "@/ui/label";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Separator } from "@/ui/separator";
import { Slider } from "@/ui/slider";
import { DialogClose } from "@radix-ui/react-dialog";
import { MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";

import type { RouterOutputs } from "@bachira/api";
import type { DURATION_TYPE } from "@bachira/db/schema/schema";

type ReportType = RouterOutputs["posts"]["getReports"]["reportData"][0];

const ActionsDropdown = ({ post }: { post: ReportType }) => {
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [deletePostOpen, setDeletePostOpen] = useState(false);
  const [ban, setBan] = useState(false);
  const [duration, setDuration] = useState(10);
  const [durationType, setDurationType] =
    useState<(typeof DURATION_TYPE)[number]>("MINUTES");

  const banMutation = api.user.banUser.useMutation();

  const utils = api.useUtils();
  const deletePost = api.posts.deletePost.useMutation({
    onMutate: async ({ ban }: { ban?: boolean | null | undefined }) => {
      if (ban) {
        await banMutation.mutateAsync({
          userId: post.userId,
          duration: duration,
          durationType: durationType,
          reason: post.reportType,
        });
      }
    },
    onSuccess: async () => {
      toast.success("Post deleted successfully");
      await utils.posts.getReports.invalidate();
      setDeletePostOpen(false);
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeletePostOpen(true)}>
            Delete post
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setConfirmationOpen(true)}>
            Ban user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will also permanently delete
              this user&apos;s data and posts all over the platform.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="destructive">Confirm</Button>
            <DialogClose>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deletePostOpen}
        onOpenChange={(value: boolean) => {
          if (!value) setBan(false);
          setDeletePostOpen(value);
        }}
      >
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will also delete other reports
              of this post.
            </DialogDescription>
          </DialogHeader>
          <Separator />

          <div className="">
            <div className="flex items-center gap-x-2">
              <Checkbox
                id="ban"
                className=" border-black"
                onCheckedChange={(e: boolean) => setBan(e)}
              />
              <label
                htmlFor="ban"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ban this user?
              </label>
            </div>

            <div
              className={cn(
                "mt-4 max-h-0 origin-top-left scale-0 space-y-4 overflow-hidden opacity-0 transition-all duration-300 ease-in-out",
                {
                  "scale-1 max-h-48 overflow-visible opacity-100": ban,
                },
              )}
            >
              <h2 className="">
                Duration: {duration === 100 ? "Infinity" : duration}
              </h2>

              <RadioGroup
                defaultValue={durationType}
                onValueChange={(value: string) =>
                  setDurationType(value as (typeof DURATION_TYPE)[number])
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MINUTES" id="minutes" />
                  <Label htmlFor="minutes">Minute/s</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="HOURS" id="hours" />
                  <Label htmlFor="hours">Hour/s</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DAYS" id="days" />
                  <Label htmlFor="days">Day/s</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MONTHS" id="MONTHS" />
                  <Label htmlFor="v">Month/s</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="YEARS" id="YEARS" />
                  <Label htmlFor="YEARS">Year/s</Label>
                </div>
              </RadioGroup>

              <Slider
                defaultValue={[10]}
                max={100}
                min={1}
                step={1}
                onValueChange={(value: number[]) => setDuration(value[0] ?? 10)}
                className=""
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() =>
                deletePost.mutate({
                  postId: post.postId,
                  fromReport: true,
                  ban,
                })
              }
            >
              Confirm
            </Button>
            <DialogClose>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionsDropdown;
