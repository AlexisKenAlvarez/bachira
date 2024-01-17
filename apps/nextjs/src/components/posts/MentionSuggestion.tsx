import type { SuggestionDataItem } from "react-mentions";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Skeleton } from "@/ui/skeleton";


const MentionSuggestion = (suggestion: SuggestionDataItem) => {
  return (
    <div className="flex gap-2 py-1">
    <Avatar className="h-8 w-8">
      <AvatarImage src={suggestion.image} className="object-cover" />
      <AvatarFallback>
        <Skeleton className="h-full w-full rounded-full" />
      </AvatarFallback>
    </Avatar>
    <div>{suggestion.display}</div>
  </div>
  );
}

export default MentionSuggestion;