import IconButton from "./IconButton";
import RemoveIcon from "@assets/images/_removeIcon.svg";

const RemoveButton = ({ onClick, className }) => (
  <IconButton
    icon={RemoveIcon}
    alt={"filter"}
    onClick={onClick}
    className={className}
  />
);

export default RemoveButton;
