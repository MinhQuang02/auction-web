import HBox from "./HBox";
import FilterButton from "./IconButton/FilterButton";
import SearchButton from "./IconButton/SearchButton";
import AddButton from "./IconButton/AddButton";
import RemoveButton from "./IconButton/RemoveButton";
import EditButton from "./IconButton/EditButton";

const ActionBar = ({ onSearch, onFilter, onAdd, onEdit, onRemove, className="" }) => {
    return (
    <HBox className={`items-center gap-10 ${className}`}>
        <HBox className="items-center gap-10">
            { onSearch && <SearchButton onClick={onSearch} /> }
            { onFilter && <FilterButton onClick={onFilter} /> }
        </HBox>

        <div className="w-14 h-14" />

        <HBox className="items-center gap-10">
            { onAdd && <AddButton onClick={onAdd} /> }
            { onEdit && <EditButton onClick={onEdit} /> }
            { onRemove && <RemoveButton onClick={onRemove} /> }
        </HBox>
    </HBox>
    )
}

export default ActionBar;