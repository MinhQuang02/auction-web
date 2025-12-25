import IconButton from "./IconButton";
import EditIcon from "@assets/images/_editIcon.svg";

const EditButton = ({ onClick, className }) => (
  <IconButton
    icon={EditIcon}
    alt={"filter"}
    onClick={onClick}
    className={className}
  />
);

export default EditButton;
