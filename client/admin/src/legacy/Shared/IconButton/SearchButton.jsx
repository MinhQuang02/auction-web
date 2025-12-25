import IconButton from "./IconButton";
import SearchIcon from "@assets/images/_searchIcon.svg";

const SearchButton = ({ onClick, className }) => (
  <IconButton
    icon={SearchIcon}
    alt={"search"}
    onClick={onClick}
    className={className}
  />
);

export default SearchButton;
