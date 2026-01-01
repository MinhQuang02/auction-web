import { useState, useEffect } from "react";
import HBox from "./HBox";
import AddButton from "./IconButton/AddButton";
import RemoveButton from "./IconButton/RemoveButton";
import EditButton from "./IconButton/EditButton";
import FilterButton from "./IconButton/FilterButton";

const ActionBar = ({
  onSearch,
  onFilter,
  onAdd,
  onEdit,
  onRemove,
  leftExtras,
  rightExtras,
  className = "",
}) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!onSearch) return;
    const t = setTimeout(() => onSearch(query), 250);
    return () => clearTimeout(t);
  }, [query, onSearch]);

  return (
    <HBox className={`items-center gap-10 ${className}`}>
      {/* LEFT SIDE */}
      <HBox className="items-center gap-6 flex-1">
        {onSearch && (
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
        )}

        {onFilter && <FilterButton onClick={onFilter} />}

        {leftExtras}
      </HBox>

      {/* RIGHT SIDE */}
      <HBox className="items-center gap-6">
        {rightExtras}

        {onAdd && <AddButton onClick={onAdd} />}
        {onEdit && <EditButton onClick={onEdit} />}
        {onRemove && <RemoveButton onClick={onRemove} />}
      </HBox>
    </HBox>
  );
};

export default ActionBar;
