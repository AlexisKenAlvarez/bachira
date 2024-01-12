import { HoverCardContent } from "../ui/hover-card";
import Image from "next/image";
import { Button } from "../ui/button";
import { useState } from "react";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import { SessionUser } from "@/lib/userTypes";
import { PostType } from "@/lib/postTypes";
import { useRouter } from "next/navigation";
import { Settings, UserCheck2, UserPlus2 } from "lucide-react";

const ProfileCardContent = ({
  user,
  isFollowing,
  post,
}: {
  isFollowing: boolean;
  post: PostType;
  user: SessionUser;
}) => {
  const [follows, setFollow] = useState<boolean>(isFollowing);
  const router = useRouter()
  const followUser = api.user.followUser.useMutation({
    onMutate: () => {
      const previousState = follows;

      setFollow(true);

      return {
        previousLike: previousState,
      };
    },
    onError(err, _, context) {
      const errMessage = err.message;

      if (errMessage === "TOO_MANY_REQUESTS") {
        toast.error("You are doing that too much. Try again later.");
      }

      setFollow(context!.previousLike);
    },
    onSettled: () => {
      console.log("LIKE ACTION");
    },
  });

  const unfollow = api.user.followUser.useMutation({
    onMutate: () => {
      const previousState = follows;

      setFollow(false);

      return {
        previousLike: previousState,
      };
    },
    onError: (err, variables, context) => {
      const errMessage = err.message;

      if (errMessage === "TOO_MANY_REQUESTS") {
        toast.error("You are doing that too much. Try again later.");
      }

      setFollow(context!.previousLike);
    },
    onSettled: () => {
      console.log("DISLIKE ACTION");
    },
  });

  const handleFollow = async () => {
    try {
      if (follows) {
        // Unfollow user
        await unfollow.mutateAsync({
          followerId: user.id,
          followingId: post.userId,
          action: "unfollow",
        });
      } else {
        // Follow user
        await followUser.mutateAsync({
          followerName: user.username,
          followerId: user.id,
          followingId: post.userId,
          action: "follow",
          image: user.image!,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <HoverCardContent
      side="bottom"
      align="center"
      // sideOffset={20}
      className=" w-fit space-y-3 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <Image
            width={600}
            height={600}
            alt={post.user.username as string}
            src={post.user.image as string}
            className="w-11 rounded-full"
          />
        </div>
        <div className="">
          <div className="flex h-auto w-full justify-between font-primary">
            <div className="">
              <h2 className=" commit w-62 truncate text-base font-bold">
                @{post.user.username as string}
              </h2>
              <h3 className="text-sm font-medium">
                {post.user.name as string}
              </h3>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-x-2">
        {post.userId === user.id ? (
          <Button
            className="group w-full gap-x-2 px-6 text-sm font-semibold"
            disabled={!user}
            variant="secondary"
            onClick={() => router.push("/profile/edit")}
          >
            <Settings
              size={18}
              className="duration-500 ease-in-out group-hover:rotate-180"
            />
            Edit Profile
          </Button>
        ) : (
          <Button
            className="w-full px-7"
            onClick={handleFollow}
            disabled={status === "loading"}
            variant={follows ? "secondary" : "default"}
          >
            {follows ? (
              <span className="flex items-center gap-2">
                <UserCheck2 /> Following
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus2 /> Follow
              </span>
            )}
          </Button>
        )}
      </div>
    </HoverCardContent>
  );
};

export default ProfileCardContent;
