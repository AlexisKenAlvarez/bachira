import { MessageCircle, Share2, ThumbsUp } from "lucide-react";

const PostButtons = () => {
  return (
    <div>
      <div className="flex w-full p-1 text-sm">
        <button className="flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100">
          <ThumbsUp size="16" />
          <p className="">Like</p>
        </button>
        <button className="flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100">
          <MessageCircle size="16" />
          <p className="">Comment</p>
        </button>
        <button className="flex w-full items-center justify-center gap-x-1 rounded-md py-2 hover:bg-slate-100">
          <Share2 size="16" />
          <p className="">Share</p>
        </button>
      </div>
    </div>
  );
};

export default PostButtons;
