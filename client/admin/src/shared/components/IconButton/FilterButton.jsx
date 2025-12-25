import IconButton from "./IconButton";
import FilterIcon from "@assets/images/_filterIcon.svg";

const FilterButton = ({ onClick, className }) => (
  <IconButton
    icon={FilterIcon}
    alt={"filter"}
    onClick={onClick}
    className={className}
  />
);

export default FilterButton;
