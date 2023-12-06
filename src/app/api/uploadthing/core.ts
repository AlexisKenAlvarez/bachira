import { authOptions } from "@/server/auth";
import { db } from "@/server/db";
import { users } from "@/server/db/schema/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";
const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .input(
      z.object({
        update: z.enum(["cover", "profile"]),
      }),
    )
    .middleware(async ({ input }) => {
      const session = await getServerSession(authOptions);

      // If you throw, the user will not be able to upload
      if (!session) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { success: true, userId: session.user.id, update: input.update };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log("Upload done, File url: ", file.url);

      await db
        .update(users)
        .set(
          metadata.update === "cover"
            ? { coverPhoto: file.url }
            : { image: file.url },
        )
        .where(eq(users.id, metadata.userId));
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
