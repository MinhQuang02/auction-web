import IconButton from "./IconButton"
import AddIcon from "assets/images/_addIcon.svg"

const AddButton = ({ onClick, className }) => (
    <IconButton icon={AddIcon} alt={"filter"} onClick={onClick} className={className} />
)

export default AddButton;