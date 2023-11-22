import { api } from "@/trpc/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {useRouter} from 'next/navigation';

const SearchUser = ({ searchValue, closeSearch }: { searchValue: string, closeSearch: () => void }) => {
  const router = useRouter()
  const { data, fetchNextPage } = api.user.searchUser.useInfiniteQuery(
    {
      limit: 6,
      searchValue,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
      refetchOnMount: true,
    },
  );

  const navigateProfile = (user: string) => {
    console.log(user);
    router.push(`/${user}`)
    // router.refresh()
  }

  return (
    <motion.div
      key="SearchInput"
      initial={{ maxHeight: "0px" }}
      animate={{ maxHeight: "250px" }}
      transition={{ duration: 0.4, ease: [0.16, 0.77, 0.47, 0.97] }}
      exit={{ maxHeight: "0px" }}
      className="!absolute h-[23rem] w-[300px] -translate-x-12 translate-y-2 overflow-hidden rounded-md border bg-white"
    >
      <div className="max-h-full w-full overflow-y-scroll py-4">
        {data?.pages.map((page, i) => (
          <div key={i}>
            {page.searchedUsers.map((user) => (
 
                <button className="flex gap-3 py-2 w-full hover:bg-primary/5 px-4" key={user.id} onClick={() => navigateProfile(user.username as string)}>
                  <Image
                    src={user.image as string}
                    alt={user.username as string}
                    className="h-10 w-10 shrink-0 rounded-full"
                    width={500}
                    height={500}
                  />

                  <div className="flex flex-col justify-center">
                    <h1 className="max-w-[6rem] truncate font-primary font-semibold md:max-w-[14rem] text-left">
                      {user.username}
                    </h1>

                    <h2 className="max-w-[8rem] truncate font-primary text-xs md:max-w-[10rem]">
                      {user.name}
                    </h2>
                  </div>
                </button>
     
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SearchUser;
