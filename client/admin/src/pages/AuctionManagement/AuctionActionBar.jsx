import { useState, useEffect } from "react";
import HBox from "@components/HBox";
import AddButton from "@components/IconButton/AddButton";
import RemoveButton from "@components/IconButton/RemoveButton";
import EditButton from "@components/IconButton/EditButton";

const AuctionActionBar = ({
  search = "",
  status = "all",
  sortBy = "time_desc",
  onSearch,
  onStatusChange,
  onSortChange,
  onAdd,
  onEdit,
  onRemove,
  className = "",
}) => {
  const [query, setQuery] = useState(search);

  /* Keep local input in sync if parent resets search */
  useEffect(() => {
    setQuery(search);
  }, [search]);

  /* Debounced search */
  useEffect(() => {
    if (!onSearch) return;
    const t = setTimeout(() => onSearch(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query, onSearch]);

  return (
    <HBox className={`items-center gap-10 ${className}`}>
      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="h-14 px-4 rounded-md border shadow-lg"
      />

      {/* Status Filter (backend-aligned) */}
      <select
        value={status}
        className="h-14 px-4 rounded-md border shadow-lg"
        onChange={(e) => onStatusChange?.(e.target.value)}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="sold">Sold</option>
        <option value="ended_no_winner">Ended (no winner)</option>
        <option value="removed">Removed</option>
      </select>

      {/* Sort (backend-driven only) */}
      <select
        value={sortBy}
        className="h-14 px-4 rounded-md border shadow-lg"
        onChange={(e) => onSortChange?.(e.target.value)}
      >
        <option value="time_desc">Ending soon</option>
        <option value="price_asc">Price ↑</option>
      </select>

      <HBox className="ml-auto gap-6">
        {onAdd && <AddButton onClick={onAdd} />}
        {onEdit && <EditButton onClick={onEdit} />}
        {onRemove && <RemoveButton onClick={onRemove} />}
      </HBox>
    </HBox>
  );
};

export default AuctionActionBar;
