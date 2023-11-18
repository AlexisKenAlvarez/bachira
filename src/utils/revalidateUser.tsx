'use server'
import { revalidatePath } from "next/cache";

export async function revalidateUser() {
  try {
    console.log("Revalidating user...");
    revalidatePath("/[username]", "layout");
  } catch (error) {
    return { message: 'Failed to revalidate' }
  }
}