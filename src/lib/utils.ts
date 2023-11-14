import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function toPusherKey(key: string) {
  return key.replace(/:/g, '__')
}

export const timeAgo = (created: string) => {
  const now = new Date();
  const createdAt = new Date(created);

  const seconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

  if (seconds < 60) {
    return (`${seconds} seconds ago`);
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (seconds < 2592000) {
    const weeks = Math.floor(seconds / 604800);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else if (seconds < 31536000) {
    const months = Math.floor(seconds / 2592000);
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else {
    const years = Math.floor(seconds / 31536000);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  }
};