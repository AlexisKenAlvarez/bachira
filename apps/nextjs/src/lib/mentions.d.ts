// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SuggestionDataItem } from "react-mentions";

declare module "react-mentions" {
  export interface SuggestionDataItem {
    id: string | number;
    display?: string;
    image?: string;
  }
}
