import { useDeleteImage } from "@/hooks/useDeleteImage";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { userDataOutput } from "@/lib/routerTypes";
import { useUploadThing } from "@/utils/uploadthing";
import { FileWithPath } from "@uploadthing/react";
import { useDropzone } from "@uploadthing/react/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ImageIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { Button } from "../ui/button";

const CoverButton = ({
  userData,
}: {
  userData: NonNullable<userDataOutput>;
}) => {
  const  { deleteImage }  = useDeleteImage()
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { startUpload, permittedFileInfo } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {
      toast.success("Image uploaded!", { id: "uploadToast", duration: 3000 });
      router.refresh();
    },
    onUploadError: () => {
      toast.error("Sorry there was an error", {
        id: "uploadToast",
        duration: 3000,
      });
    },
  });

  const fileTypes = permittedFileInfo?.config
    ? Object.keys(permittedFileInfo?.config)
    : [];

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
    multiple: false,
    noDrag: true,
  });

  const ref = useOutsideClick(() => {
    if (open) {
      setOpen(false);
    }
  });

  useEffect(() => {
    if (files.length > 0) {
      deleteImage({
        image: userData[0]?.coverPhoto as string,
        deleteFromDb: false,
        deleteFrom: 'cover'
      });

      setOpen(false);
      startUpload(files, {
        update: 'cover'
      });
      toast.loading("Uploading image. Do not leave the page", {
        id: "uploadToast",
        duration: Infinity,
      });
    }
  }, [files]);
  return (
    <div className="relative m-5 mb-8 h-fit w-fit font-primary ">
      <Button
        variant="ghost"
        className="rounded-md bg-white px-5  py-2 font-primary text-sm font-semibold text-black"
        onClick={() => {
          setOpen(true);
        }}
      >
        <p className="flex items-center gap-x-2">
          <Camera
            className="inline-block"
            size={21}
            fill="black"
            stroke="white"
          />
          Edit cover
        </p>
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 3 }}
            animate={{ opacity: 100, scale: 1 }}
            transition={{ duration: 0.2 }}
            exit={{ opacity: 0, scale: 0.5, y: 3 }}
            className="font-regular absolute right-0 z-20 h-fit w-44 origin-top translate-y-full overflow-hidden rounded-md border bg-white text-sm shadow-sm"
            ref={ref}
          >
            <button className="relative w-full space-x-2 bg-white p-2 hover:bg-slate-100">
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <div className="flex items-center space-x-2">
                  <ImageIcon className="" size="16" />
                  <p className="">Upload Photo</p>
                </div>
              </div>
            </button>
            <button
              className="flex w-full items-center space-x-2 bg-white p-2 hover:bg-slate-100"
              onClick={async () => {
                await deleteImage({
                  image: userData[0]?.coverPhoto as string,
                  refresh: true,
                  withToast: true,
                  deleteFromDb: true,
                  userId: userData[0]?.id,
                  deleteFrom: "cover"
                });
              }}
            >
              <Trash2 size={16} />
              <p className="">Delete photo</p>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoverButton;
