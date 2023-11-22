import { motion } from "framer-motion";

const SearchUser = () => {
  return (
    <motion.div
      key="SearchInput"
      initial={{ maxHeight: "0px" }}
      animate={{ maxHeight: "200px" }}
      transition={{ duration: 0.4, ease: [0.16, 0.77, 0.47, 0.97] }}
      exit={{ maxHeight: "0px" }}
      className="!absolute h-[20rem] w-[300px] -translate-x-12 translate-y-2 overflow-hidden rounded-md border bg-white"
    ></motion.div>
  );
};

export default SearchUser;
