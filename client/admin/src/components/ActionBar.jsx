import { useState, useEffect } from "react";
import HBox from "./HBox";
import FilterButton from "./IconButton/FilterButton";
import SearchButton from "./IconButton/SearchButton";
import AddButton from "./IconButton/AddButton";
import RemoveButton from "./IconButton/RemoveButton";
import EditButton from "./IconButton/EditButton";

const ActionBar = ({
  onSearch,
  onFilter,
  onAdd,
  onEdit,
  onRemove,
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [filterActive, setFilterActive] = useState(false);

  useEffect(() => {
    if (!onSearch) return;
    const t = setTimeout(() => onSearch(query), 250);
    return () => clearTimeout(t);
  }, [query, onSearch]);

  const toggleFilter = () => {
    setFilterActive((v) => !v);
    onFilter?.();
  };

  return (
    <HBox className={`items-center gap-10 ${className}`}>
      <HBox className="items-center gap-10">
        {onSearch && (
          <HBox className="items-center gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="
                h-14 px-4 rounded-md
                bg-white text-black
                border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-primary
              "
            />
            {/* <SearchButton /> */}
          </HBox>
        )}

        {/* {onFilter && (
          <FilterButton onClick={toggleFilter} active={filterActive} />
        )} */}
      </HBox>

      <div className="w-14 h-14" />

      <HBox className="items-center gap-10">
        {onAdd && <AddButton onClick={onAdd} />}
        {onEdit && <EditButton onClick={onEdit} />}
        {onRemove && <RemoveButton onClick={onRemove} />}
      </HBox>
    </HBox>
  );
};

export default ActionBar;
