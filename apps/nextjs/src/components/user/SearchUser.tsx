import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const SearchUser = ({ searchValue }: { searchValue: string }) => {
  const [ref, inView] = useInView();

  const router = useRouter();
  const { data, fetchNextPage } = api.user.searchUser.useInfiniteQuery(
    {
      limit: 5,
      searchValue,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.nextCursor;
      },
      refetchOnMount: true,
    },
  );

  useEffect(() => {
    void (async () => {
      if (inView === true) {
        await fetchNextPage();
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

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
            {page?.searchedUsers.map((user, j) => (
              <button
                className="flex w-full gap-3 px-4 py-2 hover:bg-primary/5"
                key={user.id}
                onClick={() => router.push(`/${user.username}`)}
                ref={
                  data?.pages.length - 1 === i &&
                  page.searchedUsers.length - 1 === j
                    ? ref
                    : undefined
                }
              >
                <Image
                  src={user.image}
                  alt={user.username}
                  className="h-10 w-10 shrink-0 rounded-full"
                  width={500}
                  height={500}
                />

                <div className="flex flex-col justify-center">
                  <h1 className="max-w-[6rem] truncate text-left font-primary font-semibold md:max-w-[14rem]">
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
