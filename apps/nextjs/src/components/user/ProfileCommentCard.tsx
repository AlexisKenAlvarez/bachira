import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/client";
import { Button } from "@/ui/button";
import { HoverCardContent } from "@/ui/hover-card";
import { Settings, UserCheck2, UserPlus2 } from "lucide-react";
import toast from "react-hot-toast";

import type { RouterOutputs } from "@bachira/api";

const ProfileCommentCard = ({
  user,
  data,
  userFollowing,
}: {
  data: RouterOutputs["posts"]["getComments"]["commentData"][0];
  user: NonNullable<RouterOutputs["user"]["getSession"]>;
  userFollowing: boolean;
}) => {
  const utils = api.useUtils();
  const [follows, setFollow] = useState<boolean>(userFollowing);
  const router = useRouter();
  const followMutation = api.user.followUser.useMutation({
    onMutate: () => {
      const previousState = follows;

      return {
        previousLike: previousState,
      };
    },
    onError(err) {
      const errMessage = err.message;

      if (errMessage === "TOO_MANY_REQUESTS") {
        toast.error("You are doing that too much. Try again later.");
      }
    },
    onSuccess: async () => {
      await utils.user.postFollowing.invalidate();
    },
  });

  const handleFollow = async () => {
    try {
      if (follows) {
        // Unfollow user
        await followMutation.mutateAsync({
          followerId: user.id,
          followingId: data?.user.id,
          action: "unfollow",
        });
      } else {
        // Follow user
        await followMutation.mutateAsync({
          followerName: user.user_metadata.username as string,
          followerId: user.id,
          followingId: data?.user.id,
          action: "follow",
          image: user.user_metadata.avatar_url as string,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setFollow(userFollowing);
  }, [userFollowing]);

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
            alt={data?.user.username ?? ""}
            src={data?.user.image ?? ""}
            className="w-11 rounded-full"
          />
        </div>

        <div className="">
          <div className="flex h-auto w-full justify-between font-primary">
            <div className="">
              <h2 className=" commit w-62 truncate text-base font-bold">
                @{data?.user.username}
              </h2>
              <h3 className="text-sm font-medium">{data?.user.name}</h3>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-x-2">
        {data?.user.id === user.id ? (
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
            disabled={followMutation.isPending}
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

export default ProfileCommentCard;
