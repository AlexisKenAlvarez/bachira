import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

const UserSkeleton = ({imageSize}: {imageSize?: string}) => {
  return (
    <div className="flex gap-3">
      <Skeleton className={cn('h-14 w-14 rounded-full ', {imageSize})}></Skeleton>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28"></Skeleton>
        <Skeleton className="h-3 w-16"></Skeleton>
      </div>
    </div>
  );
};

export default UserSkeleton;
