import { useRouter } from "next/navigation";
import { api } from "@/trpc/client";
import { TRPCError } from "@trpc/server";
import toast from "react-hot-toast";

export const useDeleteImage = () => {
  const router = useRouter();
  const deleteCover = api.user.deleteImage.useMutation();

  const deleteImage = async ({
    image,
    refresh,
    withToast,
    deleteFromDb,
    userId,
    deleteFrom,
  }: {
    image: string;
    refresh?: boolean;
    withToast?: boolean;
    deleteFromDb: boolean;
    userId?: string;
    deleteFrom: "cover" | "profile";
  }) => {
    const deletePromise = new Promise((resolve, reject) => {
      void (async () => {
        if (image) {
          const data = await deleteCover.mutateAsync({
            imageKey: image,
            deleteFromDb,
            deleteFrom,
            userId,
          });

          if (data.sucess) {
            if (refresh) router.refresh();
            resolve(data);
          } else {
            reject(new Error("Failed to delete."));
          }
          return data;
        } else {
          reject(new Error("No image to delete"));
        }
      })();
    });

    try {
      if (withToast) {
        await toast.promise(deletePromise, {
          loading: "Deleting image...",
          success: "Image deleted!",
          error: "Error deleting image",
        });
      } else {
        await deletePromise;
      }

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        console.log(error);
      }
    }
  };

  return { deleteImage };
};
