import { api } from "@/trpc/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const SearchUser = ({ searchValue }: { searchValue: string }) => {
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

  return (
    <motion.div
      key="SearchInput"
      initial={{ maxHeight: "0px" }}
      animate={{ maxHeight: "200px" }}
      transition={{ duration: 0.4, ease: [0.16, 0.77, 0.47, 0.97] }}
      exit={{ maxHeight: "0px" }}
      className="!absolute h-[20rem] w-[300px] -translate-x-12 translate-y-2 overflow-hidden rounded-md border bg-white"
    >
      <div className="max-h-full w-full overflow-y-scroll">
        {data?.pages.map((page, i) => (
          <div key={i}>
            {page.searchedUsers.map((user) => (
              <div className="flex gap-3" key={user.id}>
                <Image
                  src={user.image as string}
                  alt={user.username as string}
                  className="w-14 rounded-full"
                  width={500}
                  height={500}
                />

                <div className="flex flex-col justify-center">
                  <h1 className="max-w-[6rem] truncate font-primary font-bold md:max-w-[14rem]">
                    @{user.username}
                  </h1>

                  <h2 className="max-w-[8rem] truncate font-primary text-sm md:max-w-[10rem]">
                    {user.name}
                  </h2>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SearchUser;
