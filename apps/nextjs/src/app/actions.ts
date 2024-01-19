"use server"

import { cookies } from 'next/headers'
 
export async function DeleteSession() {
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log(cookies().delete('next-auth.session-token'));
}